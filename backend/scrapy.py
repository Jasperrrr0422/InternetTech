import csv
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()

img_srcs = []

try:
    # Open the URL
    driver.get("https://www.airbnb.cn/")

    # Wait for user input
    input("请滚动到页面底部，完成后输入 'ok' 继续... ")

    # After user input, wait until the main div is loaded
    main_div = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "gsgwcjk"))
    )

    # Find all child divs under the main div
    child_divs = main_div.find_elements(By.XPATH, ".//div")
    print
    # Extract img src from each child div
    for index, div in enumerate(child_divs):
        img_elements = div.find_elements(By.TAG_NAME, "img")
        for img in img_elements:
            src = img.get_attribute('src')
            if src:  # Check if src is not empty
                img_srcs.append(src)

    # Save the img src to a CSV file
    with open('img_srcs.csv', mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        for src in img_srcs:
            writer.writerow([src])

finally:
    # Optionally close the browser
    driver.quit()

