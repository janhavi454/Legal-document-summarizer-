import requests

# Test /summarize/text
url_text = "http://localhost:8000/summarize/text"
data = {"text": "This is a test legal document.", "summary_length": "short"}
response = requests.post(url_text, json=data)
print("Text endpoint:", response.status_code, response.json())

# Test /summarize/text with empty text
data_empty = {"text": "", "summary_length": "medium"}
response = requests.post(url_text, json=data_empty)
print("Text endpoint empty:", response.status_code, response.json() if response.status_code == 200 else response.text)

# Test /summarize/text with invalid summary_length
data_invalid = {"text": "Test", "summary_length": "invalid"}
response = requests.post(url_text, json=data_invalid)
print("Text endpoint invalid length:", response.status_code, response.json() if response.status_code == 200 else response.text)

# Test /summarize with file
url_file = "http://localhost:8000/summarize"
with open("test.txt", "rb") as f:
    files = {"file": f}
    data = {"summary_length": "short"}
    response = requests.post(url_file, files=files, data=data)
    print("File endpoint txt:", response.status_code)
    try:
        print(response.json())
    except:
        print(response.text)

# Test /summarize with unsupported file
try:
    with open("test.bin", "rb") as f:
        files = {"file": f}
        data = {"summary_length": "medium"}
        response = requests.post(url_file, files=files, data=data)
        print("File endpoint bin:", response.status_code)
        try:
            print(response.json())
        except:
            print(response.text)
except FileNotFoundError:
    print("test.bin not found")

# Test invalid JSON to /summarize/text
response = requests.post(url_text, data="invalid json")
print("Invalid JSON:", response.status_code, response.text)
