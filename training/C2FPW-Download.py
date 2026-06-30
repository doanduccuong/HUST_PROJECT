import pandas
import pathlib
import os
import urllib.request, urllib.error

PATH = pathlib.Path().absolute() 

def DownloadImage(url, filename, error_list):
    try:
        opener = urllib.request.build_opener()
        opener.addheaders = [('User-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36')]
        urllib.request.install_opener(opener)
        urllib.request.urlretrieve(url, filename)
        error = False
    except urllib.error.URLError as e:
        print(f"{e} - {filename}")
        error_list.append(f"{e} - {filename}")
        print(error_list)
        error = True
    return error_list, error

if __name__ == "__main__":
    csv_file = pandas.read_csv(PATH / 'C2FPW.csv')
    if(not (PATH / 'C2FPW').exists()):
        os.mkdir(PATH / 'C2FPW')

    file_log = open('error-log.txt', 'a')
    error_list = []
    error = False
    
    for _, row in csv_file.iterrows():
        image_url = row['Link']
        image_filename = row['Image'] + '.jpg'
        if any(extension in image_url for extension in['jpg', 'jpeg', 'png', 'webp']):
            error_list, error = DownloadImage(image_url, 'C2FPW/' + image_filename, error_list)
            if error:
                file_log.write(error_list[-1] + '\n')

    file_log.close()