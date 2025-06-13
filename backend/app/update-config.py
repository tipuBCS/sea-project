import json
import boto3
import os

def update_config(event, context):
    s3 = boto3.client('s3')
    api_url = event['ApiGatewayUrl']
    bucket = os.environ['CONFIG_BUCKET']
    key = os.environ['CONFIG_KEY']
    
    # Get existing config if it exists
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        config = json.loads(response['Body'].read().decode('utf-8'))
    except:
        config = {}
    
    # Update config with new API URL
    config['API_URL'] = api_url
    
    # Upload updated config
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(config, indent=2),
        ContentType='application/json'
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps('Config updated successfully')
    }
