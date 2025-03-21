from bs4 import BeautifulSoup

# Чтение HTML-файла
with open('vids.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

# Создание объекта BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Поиск всех тегов <video> и добавление атрибута playsinline
for video_tag in soup.find_all('video'):
    video_tag['playsinline'] = ''

# Запись измененного HTML обратно в файл
with open('vids.html', 'w', encoding='utf-8') as file:
    file.write(str(soup))

print("Атрибут playsinline успешно добавлен ко всем тегам <video>.")