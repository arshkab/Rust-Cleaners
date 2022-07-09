import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.firefox.options import Options
import sys
import time

URL = "https://rust-lang.github.io/rust-clippy/master/index.html"

options = Options()
options.set_preference('javascript.enabled', True)
driver = webdriver.Firefox(options=options, executable_path=GeckoDriverManager().install())

driver.get(URL)

time.sleep(2);

page_source = driver.page_source
soup = BeautifulSoup(page_source, 'lxml')

tags = soup.select('div[class="container"]')[0]
all_lints = tags.find_all("h2", {"class": "panel-title"})

sys.stdout = open('clippy_categories.txt', 'w', encoding="utf-8")
for a in all_lints:
  name = a.select('span[class="ng-binding"]')
  classification = a.select('span[class*="label label-lint-group"]')
  print(name[0].contents[0] + " " + classification[0].contents[0])
sys.stdout.close()
