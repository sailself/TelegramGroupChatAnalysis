import re
import logging
from typing import List, Dict, Tuple, Any
from collections import Counter
import string
import numpy as np

# For multilingual support
import jieba
import nltk
from langdetect import detect
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation

logger = logging.getLogger(__name__)

class NLPProcessor:
    """Service for NLP tasks like topic extraction and sentiment analysis."""
    
    def __init__(self):
        """Initialize the NLP processor."""
        self._load_resources()
        
        # Configure stopwords for different languages
        try:
            self.stopwords = {
                'en': set(nltk.corpus.stopwords.words('english')),
                'zh': self._load_chinese_stopwords(),
                'zh-tw': self._load_chinese_stopwords(),  # Traditional Chinese
                'default': set()
            }
        except Exception as e:
            logger.warning(f"Unable to load NLTK stopwords: {e}. Using empty stopwords.")
            self.stopwords = {
                'en': set(),
                'zh': self._load_chinese_stopwords(),
                'zh-tw': self._load_chinese_stopwords(),
                'default': set()
            }
        
        # Regex patterns
        self.url_pattern = re.compile(r'https?://\S+|www\.\S+')
        self.emoji_pattern = re.compile(r':[a-zA-Z0-9_]+:')
        
    def _load_resources(self):
        """Load necessary NLP resources."""
        try:
            # Download NLTK resources if not already present
            nltk.download('stopwords', quiet=True)
            nltk.download('punkt', quiet=True)
            nltk.download('vader_lexicon', quiet=True)
            
            # For Chinese text processing
            jieba.initialize()
            
        except Exception as e:
            logger.error(f"Error loading NLP resources: {e}")
    
    def _load_chinese_stopwords(self) -> set:
        """Load Chinese stopwords."""
        # A small set of common Chinese stopwords
        # In a production system, you'd load from a comprehensive file
        return {
            '的', '了', '和', '是', '就', '都', '而', '及', '與', '著',
            '或', '一個', '沒有', '我們', '你們', '他們', '她們', '自己',
            '這', '那', '這個', '那個', '這些', '那些', '這樣', '那樣',
            '不', '沒', '不是', '不能', '不要', '不會',
        }
    
    def detect_language(self, text: str) -> str:
        """Detect the language of a text."""
        try:
            if not text or len(text.strip()) < 5:
                return 'unknown'
            
            return detect(text)
        except:
            return 'unknown'
    
    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text for analysis."""
        if not text:
            return ""
        
        # Remove URLs
        text = self.url_pattern.sub('', text)
        
        # Remove emojis
        text = self.emoji_pattern.sub('', text)
        
        # Remove punctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Convert to lowercase for non-Chinese text
        lang = self.detect_language(text)
        if lang not in ['zh', 'zh-tw']:
            text = text.lower()
        
        return text
    
    def tokenize(self, text: str) -> List[str]:
        """Tokenize text based on detected language."""
        text = self.preprocess_text(text)
        if not text:
            return []
        
        lang = self.detect_language(text)
        
        if lang in ['zh', 'zh-tw']:
            # Chinese tokenization
            return list(jieba.cut(text))
        else:
            # Default to English/other languages
            return nltk.word_tokenize(text)
    
    def extract_topics(self, text: str, num_topics: int = 5, num_words: int = 5) -> List[Tuple[str, float]]:
        """
        Extract main topics from text using LDA topic modeling.
        
        Args:
            text: The text to analyze
            num_topics: Number of topics to extract
            num_words: Number of words per topic
            
        Returns:
            List of (topic, weight) tuples
        """
        try:
            if not text or len(text.strip()) < 100:  # Require more text for LDA
                return []
            
            # Preprocess
            processed_text = self.preprocess_text(text)
            lang = self.detect_language(processed_text)
            
            # Get stopwords for detected language
            stop_words = self.stopwords.get(lang, self.stopwords['default'])
            
            # For Chinese text, use jieba to tokenize first
            if lang in ['zh', 'zh-tw']:
                tokens = list(jieba.cut(processed_text))
                docs = [' '.join(tokens)]
            else:
                # Tokenize and create documents
                sentences = nltk.sent_tokenize(processed_text)
                docs = [self.preprocess_text(sent) for sent in sentences if len(sent.strip()) > 20]
                
                if not docs:
                    docs = [processed_text]
            
            # Create document-term matrix
            count_vectorizer = CountVectorizer(
                max_df=0.95, 
                min_df=1,  # Change min_df from 2 to 1 to avoid the error
                max_features=1000,
                stop_words=stop_words if lang == 'en' else None
            )
            
            try:
                # Wrap this block in a try-except to catch vectorizer-specific errors
                dtm = count_vectorizer.fit_transform(docs)
                feature_names = count_vectorizer.get_feature_names_out()
                
                if dtm.shape[0] < 3 or dtm.shape[1] < 10:
                    # Not enough data for meaningful LDA
                    # Fall back to TF-IDF based extraction
                    tfidf_vectorizer = TfidfVectorizer(
                        max_df=0.95, 
                        min_df=1,  # Ensure min_df is 1 to avoid errors with small document sets
                        max_features=1000,
                        stop_words=stop_words if lang == 'en' else None
                    )
                    
                    tfidf_matrix = tfidf_vectorizer.fit_transform(docs)
                    feature_names = tfidf_vectorizer.get_feature_names_out()
                    
                    # Get term importance scores
                    tfidf_scores = zip(feature_names, tfidf_matrix.sum(axis=0).tolist()[0])
                    top_words = sorted(tfidf_scores, key=lambda x: x[1], reverse=True)
                    
                    # Filter out stopwords and single-character words
                    filtered_words = [(word, score) for word, score in top_words 
                                    if word not in stop_words and len(word) > 1]
                    
                    # Try to group related terms for more meaningful topics
                    topics = []
                    for i in range(min(num_topics, len(filtered_words))):
                        if i < len(filtered_words):
                            word, score = filtered_words[i]
                            topics.append((word, float(score)))
                    
                    return topics[:num_topics]
                
                # Apply LDA with proper error handling
                n_components = min(num_topics, min(dtm.shape[0], dtm.shape[1])-1)
                if n_components < 1:
                    # If we can't create a valid LDA model, return simple word-based topics
                    top_indices = np.argsort(dtm.sum(axis=0).A1)[-num_topics:]
                    return [(feature_names[i], 1.0/(j+1)) for j, i in enumerate(top_indices)]
                
                lda = LatentDirichletAllocation(
                    n_components=n_components,
                    random_state=42,
                    learning_method='online'
                )
                
                lda.fit(dtm)
                
                # Format LDA topics
                topics = []
                for topic_idx, topic in enumerate(lda.components_):
                    # Get top words for this topic
                    top_indices = topic.argsort()[:-num_words-1:-1]
                    top_words = [feature_names[i] for i in top_indices 
                                if feature_names[i] not in stop_words and len(feature_names[i]) > 1]
                
            except Exception as e:
                logger.warning(f"Advanced topic extraction failed: {e}")
                # Fallback to a simpler approach
                word_counts = Counter()
                for doc in docs:
                    words = doc.split()
                    word_counts.update(words)
                
                # Filter out stopwords and get top words
                top_words = [(word, count) for word, count in word_counts.most_common(num_topics*num_words)
                            if word not in stop_words and len(word) > 1]
                
                return top_words[:num_topics]
                
        except Exception as e:
            logger.error(f"Error extracting topics: {e}")
            return []
    
    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """
        Analyze sentiment of the text.
        
        Args:
            text: The text to analyze
            
        Returns:
            Dictionary with sentiment scores {'positive': x, 'negative': y, 'neutral': z}
        """
        try:
            if not text:
                return {"positive": 0.0, "negative": 0.0, "neutral": 1.0}
            
            lang = self.detect_language(text)
            
            # For English text, use VADER
            if lang == 'en':
                from nltk.sentiment import SentimentIntensityAnalyzer
                sia = SentimentIntensityAnalyzer()
                sentiment = sia.polarity_scores(text)
                
                return {
                    "positive": sentiment['pos'],
                    "negative": sentiment['neg'],
                    "neutral": sentiment['neu']
                }
            else:
                # For other languages, use a very simple approach
                # Count positive and negative words based on a small lexicon
                # This is just a placeholder - in a real system, you would use
                # language-specific sentiment analysis tools
                
                # Very small positive/negative Chinese lexicon
                # In production, use comprehensive lexicons
                pos_words = {'好', '喜欢', '爱', '棒', '优秀', '开心', '快乐', '美', '赞', '佳'}
                neg_words = {'坏', '差', '烂', '讨厌', '恨', '悲伤', '痛苦', '丑', '糟', '恶心'}
                
                tokens = self.tokenize(text)
                pos_count = sum(1 for t in tokens if t in pos_words)
                neg_count = sum(1 for t in tokens if t in neg_words)
                total = pos_count + neg_count
                
                if total == 0:
                    return {"positive": 0.1, "negative": 0.1, "neutral": 0.8}
                
                pos_score = pos_count / total
                neg_score = neg_count / total
                neu_score = 1.0 - (pos_score + neg_score)
                
                return {
                    "positive": pos_score,
                    "negative": neg_score,
                    "neutral": max(0, neu_score)
                }
                
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {"positive": 0.0, "negative": 0.0, "neutral": 1.0} 