import json
import sys
import ijson  # We'll use ijson for streaming JSON parsing
import os
from datetime import datetime
from collections import Counter

def analyze_structure(file_path):
    print(f"Analyzing: {file_path}")
    try:
        # Get basic structure without loading the entire file
        with open(file_path, 'r', encoding='utf-8') as f:
            # Get the root structure
            root_keys = []
            parser = ijson.parse(f)
            for prefix, event, value in parser:
                if prefix == '' and event == 'map_key':
                    root_keys.append(value)
                    if len(root_keys) > 10:  # Just get a few root keys
                        break
        
        print("\nJSON Keys at root level:")
        for key in root_keys:
            print(f"- {key}")
        
        # Now get information about messages
        print("\nAnalyzing messages structure...")
        with open(file_path, 'r', encoding='utf-8') as f:
            # Get a larger sample of messages to analyze
            sample_size = 1000  # Look at 1000 messages max
            message_types = Counter()
            message_samples = {}
            message_fields = Counter()
            users = Counter()
            media_types = Counter()
            
            # Try to get a sample of text, photo, sticker messages, etc.
            count = 0
            for msg in ijson.items(f, 'messages.item'):
                count += 1
                
                # Track message types and fields
                msg_type = msg.get('type', 'unknown')
                message_types[msg_type] += 1
                
                # Track all fields that appear in messages
                for key in msg.keys():
                    message_fields[key] += 1
                
                # Track users
                if 'from_id' in msg:
                    users[msg.get('from_id')] += 1
                
                # Track media types
                if 'media_type' in msg:
                    media_types[msg.get('media_type')] += 1
                
                # Keep samples of different message types
                if msg_type not in message_samples:
                    message_samples[msg_type] = msg
                
                # Keep samples with different media types
                if 'media_type' in msg and msg.get('media_type') not in [m.get('media_type', '') for m in message_samples.values() if 'media_type' in m]:
                    message_samples[f"{msg_type}_media_{msg.get('media_type')}"] = msg
                
                # Keep samples with different content types
                if 'photo' in msg and 'photo' not in message_samples:
                    message_samples['photo'] = msg
                if 'sticker_emoji' in msg and 'sticker_emoji' not in message_samples:
                    message_samples['sticker'] = msg
                if 'poll' in msg and 'poll' not in message_samples:
                    message_samples['poll'] = msg
                if 'forwarded_from' in msg and 'forwarded' not in message_samples:
                    message_samples['forwarded'] = msg
                
                # Stop after examining enough messages
                if count >= sample_size:
                    break
            
            # Print message type statistics
            print(f"\nAnalyzed {count} messages")
            print(f"\nMessage types:")
            for msg_type, count in message_types.most_common():
                print(f"- {msg_type}: {count}")
            
            # Print common message fields
            print(f"\nCommon message fields:")
            for field, count in message_fields.most_common(20):
                print(f"- {field}: {count}")
            
            # Print media types
            print(f"\nMedia types:")
            for media_type, count in media_types.most_common():
                print(f"- {media_type}: {count}")
            
            # Print details of sample messages
            print(f"\nFound {len(message_samples)} different message variants:")
            for msg_type, msg in message_samples.items():
                print(f"\n{'='*50}")
                print(f"Message Variant: {msg_type}")
                print(f"{'='*50}")
                
                # Print selective fields to avoid overwhelming output
                important_fields = ['id', 'type', 'date', 'from', 'from_id', 'text', 'media_type', 
                                   'photo', 'sticker_emoji', 'poll', 'forwarded_from']
                
                for key in important_fields:
                    if key in msg:
                        value = msg[key]
                        value_type = type(value).__name__
                        
                        # Print a preview of the value with special handling for lists and dicts
                        if isinstance(value, (list, dict)):
                            value_preview = f"{value_type} with {len(value)} items"
                            if len(value) > 0:
                                if isinstance(value, list) and len(value) > 0:
                                    first_item = value[0]
                                    if isinstance(first_item, dict) and len(first_item) > 0:
                                        value_preview += f", first item keys: {list(first_item.keys())[:3]}"
                                    else:
                                        value_preview += f", first item: {str(first_item)[:30]}"
                                elif isinstance(value, dict):
                                    value_preview += f", keys: {list(value.keys())[:5]}"
                        else:
                            value_preview = str(value)[:100] + '...' if len(str(value)) > 100 else str(value)
                        
                        print(f"- {key} ({value_type}): {value_preview}")
            
            # Print number of unique users
            print(f"\nFound {len(users)} unique users")
            
            # Count messages using simpler method - scan file line by line
            print("\nCounting messages (approximate)...")
            with open(file_path, 'r', encoding='utf-8') as f:
                msg_count = 0
                for line in f:
                    if '"type": "message"' in line:
                        msg_count += 1
                print(f"Estimated message count: {msg_count}")
                
                # Get file size in MB
                file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
                print(f"File size: {file_size_mb:.2f} MB")
    
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    start_time = datetime.now()
    if len(sys.argv) > 1:
        analyze_structure(sys.argv[1])
    else:
        analyze_structure("result.json")
    end_time = datetime.now()
    print(f"\nAnalysis completed in {(end_time - start_time).total_seconds():.2f} seconds") 