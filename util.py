import re

# 数字以外を削除
def trim_isbn(isbn):
    return  re.sub(r"\D", "", isbn)

