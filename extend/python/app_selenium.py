from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.ie.options import Options as IeOptions
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import getpass
import time
import re
import  traceback
driver = '' # 浏览器driver
driver_dict = {} # 浏览器driver字典类型，方便利用key定位，
driver_num = 0  # 动态key，

def driver_key_num(driver):
    """
    动态driver以全局字典形式输出，
    :param driver: driver，
    :return:字典的key，
    """
    global driver_num
    global driver_dict
    driver_num_key = "driver_key" + str(driver_num)
    now_num = driver_num
    driver_num += 1
    driver_dict[driver_num_key] = driver
    driver_key = list(driver_dict.keys())
    return driver_key[now_num]

def frame_xpath(browser_name, xpath, frame_flag=False):
    """
    xpath切分，
    :param browser_name: 浏览器driver，
    :param xpath: 待处理xpath，
    :param frame_flag: 是否有切换frame，
    :return: xpath
    """
    try:
        xpath.index(",/")
        xpath_list = xpath.split(",")
        for i in range(len(xpath_list)-1):
            browser_name.switch_to.frame(browser_name.find_element_by_xpath(xpath_list[i]))
        frame_flag = True
        return xpath_list[-1], frame_flag
    except ValueError as ve:
        #print(ve)
        return xpath, frame_flag

def frame_handle(browser_name, frame_location, frame_type):
    """
    frame切换，
    :param browser_name: 浏览器driver，
    :param frame_location: frame定位值，
    :param frame_type: frame定位类型，
    :return:
    """
    if frame_location:
        if frame_type == "frame_str":
            browser_name.switch_to.frame(frame_location)
        else:
            browser_name.switch_to.frame(int(frame_location) - 1)
    return

def driver_handle(browser_name):
    """
    切换当前浏览器driver，
    :param browser_name: driver变量名，
    :return:driver,
    """
    if browser_name:
        return driver_dict[browser_name]
    else:
        global driver
        return driver

# 考虑下要不要合成一个函数，
def browser_chrome(browser_path="", driver_path=""):
    """
    谷歌内核浏览器兼容，
    :param browser_path: 浏览器路径，
    :param driver_path: 驱动路径，
    :return: driver，
    """
    global driver
    if len(browser_path) > 0:
        options = ChromeOptions()
        options.binary_location = browser_path
    else:
        options = None
    if len(driver_path) == 0 :
        driver_path = "chromedriver"
    driver = webdriver.Chrome(executable_path=driver_path, options=options)
    return driver

def browser_ie(browser_path="", driver_path=""):
    """
    ie内核浏览器兼容，
    :param browser_path: 浏览器路径，
    :param driver_path: 驱动路径，
    :return: driver，
    """
    global driver
    if len(browser_path) > 0:
        options = IeOptions()
        options.binary_location = browser_path
    else:
        options = None
    if len(driver_path) == 0 :
        driver_path = "IEDriverServer.exe"
    driver = webdriver.Ie(executable_path=driver_path, options=options)  # 需要在设置-安全-四个区域中统一启用安全模式，
    return driver

def browser_firefox(browser_path="", driver_path=""):
    """
    火狐内核浏览器兼容，
    :param browser_path: 浏览器路径，
    :param driver_path: 驱动路径，
    :return: driver，
    """
    global driver
    if len(browser_path) > 0:
        options = FirefoxOptions()
        options.binary_location = browser_path
    else:
        options = None
    if len(driver_path) == 0 :
        driver_path = "geckodriver"
    driver = webdriver.Firefox(executable_path=driver_path, options=options)
    return driver

def open_selenium(url, browser_type="br360", path_selenium="", chrome_driver="", open_type="newDriver"):
    """
    打开浏览器，1
    :param url: 打开网站地址，
    :param path_selenium: 浏览器地址，
    :param chrome_driver: 驱动地址，
    :param open_type: 打开类型，
    :param browser_type: 浏览器类型，
    :return: driver，
    """
    browser_select = {
        "br360" : browser_chrome,
        "chrome" : browser_chrome,
        "firefox": browser_firefox,
        "ie": browser_ie
    }
    sys_name = getpass.getuser()
    if len(path_selenium) == 0 and browser_type == "br360":# 360默认地址，测试使用，
        path_selenium = r"C:\Users\%s\AppData\Roaming\360se6\Application\360se.exe" % sys_name  # 360默认安装位置，
    if len(chrome_driver) == 0 and browser_type == "br360":
        chrome_driver = r'C:\Users\%s\Desktop\chromedriver.exe' % sys_name
    global driver
    if driver != '':
        if open_type == "newWindow" :
            """
            新标签，浏览器 新窗口打开连接,selenium没有，暂时使用js的，
            切换当前窗口，坑比较大，依赖网页，部分网页无法使用提示window.open not function，怀疑是依赖网页js，而部分网页js不全导致，
            """
            window_new = 'window.open("' + url + '");'
            driver.execute_script(window_new)
            windows = driver.window_handles
            driver.switch_to.window(windows[-1])  # 切换当前窗口，
            driver_key = driver_key_num(driver)
            return driver_key
        elif open_type == "nowWindow" :
            driver.get(url) # 当前标签，
            driver_key = driver_key_num(driver) # driver会有重复值，但是去掉的话，rpa无法输出，
            return driver_key
        else:
            driver = browser_select[browser_type](path_selenium, chrome_driver)
            # 设置请求超时时间，待优化，
            driver.set_page_load_timeout(600)
            driver.set_script_timeout(600)
            try:
                driver.get(url)
            except Exception as exc:
                print(exc)
                driver.execute_script("window.stop()")
            finally:
                driver_key = driver_key_num(driver)
                return driver_key
    else:
        driver = browser_select[browser_type](path_selenium, chrome_driver)
        # 设置请求超时时间，待优化，
        driver.set_page_load_timeout(600)
        driver.set_script_timeout(600)
        try:
            driver.get(url)
        except Exception as exc:
            print(exc)
            driver.execute_script("window.stop()")
        finally:
            driver_key = driver_key_num(driver)
            return driver_key

def click_selenium(xpath, click_type="left_click", browser_name=None):
    """
    点击事件，1
    :param xpath: xpath地址，
    :param click_type: 点击类型，
    :param browser_name: 对应浏览器driver，
    :return:
    """
    current_driver = driver_handle(browser_name)
    chain = ActionChains(current_driver)
    xpath, frame_flag = frame_xpath(current_driver, xpath)
    element = current_driver.find_element_by_xpath(xpath)
    click_dict = {
        "left_click" : chain.click,
        "left_double_click" : chain.double_click,
        "click_and_hold": chain.click_and_hold,
        "right_click": chain.context_click
    }
    click_dict[click_type](element).perform()
    windows = current_driver.window_handles
    current_driver.switch_to.window(windows[-1]) # 切换当前窗口，
    if frame_flag: # 退出frame，
        current_driver.switch_to.default_content()
    return

def grab_selenium(xpath, browser_name=None):
    """
    抓取单个信息，
    :param xpath: xpath地址，
    :param browser_name: 对应浏览器driver，
    :return: 单个抓取值，
    """
    current_driver = driver_handle(browser_name)
    xpath, frame_flag = frame_xpath(current_driver, xpath)
    data_info = current_driver.find_element_by_xpath(xpath).text
    if frame_flag: # 退出frame，
        current_driver.switch_to.default_content()
    return data_info

def batch_grab_selenium(xpath, browser_name=None):
    """
    抓取批量信息，
    :param xpath: xpath地址，
    :param browser_name: 对应浏览器driver，
    :return: 返回抓取的数组，
    """
    current_driver = driver_handle(browser_name)
    xpath, frame_flag = frame_xpath(current_driver, xpath)
    data_info_batch = current_driver.find_elements_by_xpath(xpath)
    data_infos = []
    for i in data_info_batch:
        data_infos.append(i.text)
    if frame_flag: # 退出frame，
        current_driver.switch_to.default_content()
    return data_infos

def close_selenium(close_type="allClose", browser_name=None):
    """
    关闭所有界面，退出driver，
    或者关闭除第一个以外的其他页面，1第一个页面句柄，
    :param browser_name: 对应浏览器driver，
    :return:
    """
    current_driver = driver_handle(browser_name)
    if close_type=="un_nowClose" :
        windows = current_driver.window_handles # 切换当前窗口，
        window_num = len(windows)
        for i in range(window_num-1): # 关闭第一个以外的页面，
            current_driver.switch_to.window(windows[i+1])
            current_driver.close()
    else:
        current_driver.quit()
    return

def close_selenium_page(browser_name=None):
    """
    关闭当前界面，1
    :param browser_name: 对应浏览器driver，
    :return:
    """
    current_driver = driver_handle(browser_name)
    current_driver.close()
    windows = current_driver.window_handles
    current_driver.switch_to.window(windows[-1]) # 切换当前窗口，
    return

def input_selenium(xpath, text, browser_name=None):
    """
    输入信息，1
    :param xpath: xpath地址，
    :param text: 输入内容，
    :param browser_name: 对应浏览器driver，
    :return:
    """
    current_driver = driver_handle(browser_name)
    xpath, frame_flag = frame_xpath(current_driver, xpath)
    current_driver.find_element_by_xpath(xpath).send_keys(text)
    if frame_flag: # 退出frame，
        current_driver.switch_to.default_content()
    return

def refresh_selenium(browser_name=None):
    """
    页面刷新，
    :param browser_name: 对应浏览器driver，
    :return:
    """
    current_driver = driver_handle(browser_name)
    current_driver.refresh()
    return

def back_selenium(browser_name=None):
    """
    页面后退，
    :param browser_name: 对应浏览器driver，
    :return:
    """
    current_driver = driver_handle(browser_name)
    current_driver.back()
    return

def forward_selenium(browser_name=None):
    """
    页面前进，
    :param browser_name: 对应浏览器driver，
    :return:
    """
    current_driver = driver_handle(browser_name)
    current_driver.forward()
    return

def max_selenium(browser_name=None):
    """
    当前窗口最大化，
    :param browser_name: 对应浏览器driver，
    :return:
    """
    current_driver = driver_handle(browser_name)
    current_driver.maximize_window()
    return

def url_selenium(browser_name=None):
    """
    获取当前driver对应的url，
    :param browser_name: 对应浏览器driver，
    :return: 返回当前url，
    """
    current_driver = driver_handle(browser_name)
    url = current_driver.current_url
    return url

def existence_selenium(xpath, browser_name=None):
    """
    判断元素是否存在，
    :param browser_name: 对应浏览器driver，
    :return: 是否存在，
    """
    current_driver = driver_handle(browser_name)
    xpath, frame_flag = frame_xpath(current_driver, xpath)
    flag = True
    try:
        current_driver.find_element_by_xpath(xpath)
    except Exception as exc:
        flag = False
    finally:
        if frame_flag:  # 退出frame，
            current_driver.switch_to.default_content()
        return flag

def attribute_selenium(xpath, attribute_name="", browser_name=None):
    """
    获取元素属性，
    :param xpath: xpath路径，
    :param attribute_name: 属性名称，
    :param browser_name: 对应浏览器driver，
    :return: 属性值，
    """
    current_driver = driver_handle(browser_name)
    xpath, frame_flag = frame_xpath(current_driver, xpath)
    attribute = current_driver.find_elements_by_xpath(xpath)
    attribute_value = []
    if attribute_name=="" :
        attribute_name="outerHTML"
        # attribute_name = "innerHTML"
    for i in attribute:
        attribute_value.append(i.get_attribute(attribute_name))
    if frame_flag:  # 退出frame，
        current_driver.switch_to.default_content()
    return attribute_value

def select_selenium(xpath, text, match_type="equal_match", browser_name=None):
    """
    选择下拉框，
    :param xpath: xpath路径，
    :param text: 下拉框匹配文本，
    :param match_type: 匹配类型，
    :param browser_name: 对应浏览器driver，
    :return:
    """
    current_driver = driver_handle(browser_name)
    # frame_handle(current_driver, frame_location, frame_type)
    xpath, frame_flag = frame_xpath(current_driver, xpath)
    selector = Select(current_driver.find_element_by_xpath(xpath))
    like_text = []
    if match_type == "like_match" :
        pattern = ".*" + text + ".*"
        for i in selector.options:
            temp_text = re.findall(pattern, i.text)
            if len(temp_text)>0 :
                like_text.extend(temp_text)
        if len(like_text)>0:
            selector.select_by_visible_text(like_text[0])
            if frame_flag:  # 退出frame，
                current_driver.switch_to.default_content()
            return
        else:
            if frame_flag:  # 退出frame，
                current_driver.switch_to.default_content()
            return
    selector.select_by_visible_text(text)
    if frame_flag: # 退出frame，
        current_driver.switch_to.default_content()
    return

def selenium_driver_wait(xpath, browser_name=None, wait_second=20):
    """
    显示等待，等待元素加载，
    :param xpath: xpath路径，
    :param wait_second: 默认超时时间，
    :param browser_name: 浏览器key，
    :return: 是否加载完成，
    """
    current_driver = driver_handle(browser_name)
    wait_flag = False
    try:
        WebDriverWait(current_driver, int(wait_second), 0.5).until(EC.presence_of_element_located((By.XPATH, xpath)))
        wait_flag = True
        return wait_flag
    except Exception as exc:
        print(exc)
        return wait_flag

def alert_grab_selenium(browser_name=None, time_out=20):
    current_driver = driver_handle(browser_name)
    try:
        WebDriverWait(current_driver, int(time_out), 0.5).until(EC.alert_is_present())
        alert = current_driver.switch_to.alert
        return alert.text
    except Exception as exc:
        #print(exc)
        return
        #current_driver.switch_to.active_element

def alert_click_selenium(browser_name=None, time_out=20, operation_type="confirm"):
    current_driver = driver_handle(browser_name)
    try:
        WebDriverWait(current_driver, int(time_out), 0.5).until(EC.alert_is_present())
        alert = current_driver.switch_to.alert
        if operation_type=="confirm" :
            alert.accept()
        else:
            alert.dismiss()
        return True
    except Exception as exc:
        err_info= traceback.format_exc()
        return err_info

def test_br():
    """
    浏览器测试，
    :return:
    """
    if not None:
        print(len(""))
    # options = firefox_options()
    # options.binary_location = r"C:\Program Files (x86)\Mozilla Firefox\firefox.exe"
    # driver_firefox = webdriver.Firefox(options=None, executable_path="geckodriver")
    # driver_firefox.get('https://www.baidu.com')

    # ie_path = r'C:\Users\shen\Desktop\IEDriverServer.exe' #需要在设置-安全-四个区域中统一启用安全模式，
    # driver_ie = webdriver.Ie(executable_path=ie_path)
    # driver_ie.get('https://www.baidu.com')
    chrome_path = r'C:\Users\shen\Desktop\chromedriver_win32 (1)\chromedriver.exe'
    driver_chrome1 = webdriver.Chrome(executable_path=chrome_path)
    driver_chrome1.get('https://www.baidu.com')
    driver_chrome2 = webdriver.Chrome(executable_path=chrome_path)
    driver_chrome2.get('https://m.jb51.net/w3school/tiy/t.asp-f=html_select_name.htm')
    input_selenium('//*[@id="kw"]', 'python', driver_chrome1)
    # select_selenium('/html/body/select', 'Au', 'like_match', browser_name=driver_chrome1, frame_location="i")
    # print(attribute_selenium('/html/body/select', browser_name=driver_chrome1))
    time.sleep(5)
    driver_chrome1.quit()
    # print(driver_chrome2)

def test():
    """
    其他测试，
    :return:
    """
    # 需要的文件的路径
    path = r'./'
    # 打印绝对路径
    #return os.path.abspath(path)
    # 获取系统用户名，
    print(getpass.getuser())
    sys_name = getpass.getuser()
    # C:\Users\shen\AppData\Roaming\360se6\Application\360se.exe
    path_selenium = r"C:\Users\%s\AppData\Roaming\360se6\Application\360se.exe" % sys_name
    print(path_selenium)
    print()
    print(type(driver))


if __name__ == '__main__':
    #test(),资源加载不到的，    iframe的，使用js的，
    """
    https://hao.360.com/?wd_xp1
    http://rpaii.com/#
    https://www.baidu.com/
    //*[@id="kw"]
    //*[@id="su"]
    //div[contains(@class, 'c-container')]/h3
    //*[@id="hotsearch-content-wrapper"]/li[1]/a/span[2]
    //li[contains(@class, 'hotsearch-item')]
    file:///C:/Users/shen/Desktop/1.html
    /html/body/select
    Audi
    """
    open_selenium("file:///C:/Users/shen/Desktop/alert.html")
    #time.sleep(1)
    #print(selenium_driver_wait('//*[@attr_name="attr_value"]', 60))
    #open_selenium("file:///C:/Users/shen/Desktop/1.html")
    #open_selenium("https://m.jb51.net/w3school/tiy/t.asp-f=html_select_name.htm")
    #open_selenium("https://www.w3school.com.cn/tiy/t.asp?f=html_select", browser_type="ie", chrome_driver=r'C:\Users\shen\Desktop\IEDriverServer.exe')
    #open_selenium("https://www.baidu.com")
    #input_selenium('//*[@id="kw"]', 'python')
    print(grab_selenium("/html/body/div"))
    click_selenium('/html/body/button[1]')
    time.sleep(1)
    print(alert_grab_selenium())
    #time.sleep(5)
    time.sleep(1)
    alert_click_selenium()
    time.sleep(1)
    print(grab_selenium("/html/body/div"))
    click_selenium('/html/body/button[2]')
    time.sleep(1)
    print(alert_grab_selenium())
    alert_click_selenium(operation_type="cancle")
    time.sleep(1)
    # alert_click_selenium()
    # time.sleep(1)
    print(grab_selenium("/html/body/div"))
    #aa = grab_selenium("//li[contains(@class, 'hotsearch-item')]")
    #print(grab_selenium("/html/body/div"))
    #print(batch_grab_selenium("//div[contains(@class, 'c-container')]/h3"))

    #print(attribute_selenium('/html/body/select'))
    #print(attribute_selenium('/html/body/select',"name"))
    #select_selenium('//*[@id="a1"],//*[@id="b2"],/html/body/select','Audi','like_match')
    #print(grab_selenium('//*[@id="a1"],//*[@id="b2"],/html/body/select'))
    #time.sleep(5)
    close_selenium("allClose")
    #test_br()
    #print(frame_xpath("/html/body/iframe[1],/html/body/iframe[2],/html/body/iframe,/html/body/select"))
    #print(re.__file__)