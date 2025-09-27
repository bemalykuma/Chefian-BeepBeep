import requests
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont

img = Image.open('images/car.jpg')
I1 = ImageDraw.Draw(img)

url = "https://api.aiforthai.in.th/lpr-v2"
payload = {'crop': '1', 'rotate': '1'}
files = {'image':open('images/car.jpg', 'rb')}
headers = {'Apikey': "xQfYMQRvmGHS5qG5UvSdwqkc9xx3JR5D",}

response = requests.post(url, files = files, data = payload, headers = headers)
print(response.json())

data = response.json()
customFont  = ImageFont.truetype('font/Kanit-Bold.ttf',65)
I1.text((10,10), "" + data[0]['lpr'], font = customFont, files = (0,255,0))
img.show()
img.save('images/result.jpg')