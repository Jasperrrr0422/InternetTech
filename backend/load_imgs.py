import pandas as pd
import requests
import os

# Load the CSV file
df = pd.read_csv('img_srcs.csv', header=None)
df.drop_duplicates(inplace=True)  # Remove duplicates
df.rename(columns={0: 'img_url'}, inplace=True)
img_urls = df['img_url'].tolist()  # Get the image URLs

# Create directory to save images if it doesn't exist
os.makedirs('imgs', exist_ok=True)

# Download images
for index, url in enumerate(img_urls):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Check for request errors
        # Save images to the 'imgs' folder
        with open(f'imgs/image_{index + 1}.jpg', 'wb') as file:
            file.write(response.content)
        print(f"Downloaded: image_{index + 1}.jpg")
        df.loc[index,'image_name'] = f'image_{index + 1}'
    except Exception as e:
        print(f"Failed to download {url}: {e}")

df.to_csv('img_srcs.csv', index=False)  # Save the updated DataFrame to CSV

