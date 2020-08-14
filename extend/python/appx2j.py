import xmltodict
import json
import re

def read_file(path):
    with open(path, "r", encoding="utf-8") as file:
        return file.read()

def str_to_json(str):
    json_str = json.loads(str)
    return json_str

def json_to_xml(text, isSelfClosing):
    try:
        json_str = str_to_json(text)
    except Exception as exc:
        print("数据转换异常，")
        print(exc)
    xml_str = xmltodict.unparse(json_str, pretty=True, encoding="utf-8")
    xml_str = self_closing(xml_str, isSelfClosing)
    return xml_str

def self_closing(xml_str, isSelfClosing):
    """
    是否自闭合空标签，
    :param isSelfClosing:
    :param xml_str:
    :return:
    """
    if(isSelfClosing=="true"):
        xml_str = re.sub(r"<(.*)>(</.*>)", r"<\1/>" , xml_str)
        return xml_str
    else:
        return xml_str

def xml_to_json(text):
    con_json = xmltodict.parse(text, encoding="utf-8")
    json_str = json.dumps(con_json)
    return json_str

if __name__ == '__main__':
    text = read_file("C:\\Users\\shen\\Desktop\\智能测试\\data2.xml")
    json_str = xml_to_json(text)
    print(json_str)
    # print(xmltodict.__file__)
    # print(json.__file__)
    # print(re.__file__)