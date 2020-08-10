import win32com.client as win32
import os
import tarfile

outlook_get_dict = {}
outlook_num = 0  # 动态key，

def outlook_key_num(outlook):
    global outlook_num
    global outlook_get_dict
    outlook_num_key = "outlook_key" + str(outlook_num)
    now_num = outlook_num
    outlook_num += 1
    outlook_get_dict[outlook_num_key] = outlook
    outlook_key = list(outlook_get_dict.keys())
    return outlook_key[now_num]

def outlook_init():
    outlook = win32.Dispatch("Outlook.Application")
    # os.startfile("outlook")
    mapi = outlook.GetNamespace("MAPI")
    # accounts = mail_item.Session.Accounts
    accounts = outlook.Session.Accounts

    return outlook, accounts, mapi

def accept_file_handle(mail_item,accept_file):
    dir_flag = os.path.isdir(accept_file)
    #file_flag = os.path.isfile(accept_file)
    if dir_flag:
        output_filename = accept_file + r"\附件.tar.gz"
        make_targz_one_by_one(output_filename, accept_file)
        mail_item.Attachments.Add(output_filename)
        os.remove(output_filename)
    else:
        try:
            accept_files = accept_file.split(";")
            for accept_file_item in accept_files:
                mail_item.Attachments.Add(accept_file_item)
        except:
            mail_item.Attachments.Add(accept_file)

"""
发送邮件，
1、发送单人，
2、发送多人，
3、包含密送抄送，
4、代送人，
5、是否草稿，
6、是否正文html格式，
7、各类单个附件，
8、各类多个文件，

获取邮件，
1、多级目录获取匹配文件名，
2、主题等信息完全匹配筛选，
3、筛选未读，
4、针对已筛选部分，标记已读，
5、限制获取数量，
"""

def outlook_send(accept_name,accept_title,accept_content,send_name=None,
                 accept_file=None,secret_accept=None,minor_accept=None,agent_send_name=None,draft_flag="no",html_flag="no"):
    """
    outlook发送邮件，
    :param send_name: 发送人邮箱，
    :param accept_name: 接收人邮箱，
    :param accept_title: 邮件标题，
    :param accept_content: 邮件正文，
    :param accept_file: 邮件附件，
    :param secret_accept: 密送人邮箱，
    :param minor_accept: 抄送人邮箱，
    :param agent_send_name: 代送人名称，
    :param draft_flag: 是否草稿，
    :param html_flag: 是否正文html格式，
    :return:
    """
    outlook, accounts, mapi = outlook_init()
    mail_item = outlook.CreateItem(0)
    account = None
    for acc in accounts:
        if acc.SmtpAddress == send_name:
            account = acc
            break
    if accept_name:
        mail_item.To = accept_name
    if minor_accept:
        mail_item.CC = minor_accept
    if accept_title:
        mail_item.Subject = accept_title
    if account:
        #mail_item.SendUsingAccount = account
        mail_item._oleobj_.Invoke(*(64209, 0, 8, 0, account))  # 指定发件人，并保存到相应的账号的草稿箱中
    if secret_accept:
        mail_item.BCC = secret_accept
    if html_flag=="yes":
        mail_item.BodyFormat = 2
        mail_item.HTMLBody = accept_content
    else:
        mail_item.Body = accept_content
    if agent_send_name:
        mail_item.SentOnBehalfOfName = agent_send_name
    if accept_file:
        accept_file_handle(mail_item,accept_file);
    if draft_flag=="yes":
        mail_item.Save()
    else:
        mail_item.Send()
    return

def make_targz_one_by_one(output_filename, source_dir):
    """
    压缩文件目录，
    :param output_filename: 输出路径，
    :param source_dir: 输入路径，
    :return:
    """
    tar = tarfile.open(output_filename,"w:gz")
    for root,dir,files in os.walk(source_dir):
        os.chdir(source_dir)
        os.chdir('..')
        path = os.getcwd()  # 通过os操做系统到文件目录的上一级 获取当前路径
        root_ = os.path.relpath(root, start=path)
        for file in files:
            pathfile = os.path.join(root_, file)
            tar.add(pathfile)
    tar.close()
    return


def outlook_get(outlook_name, file_name, find_where=None, find_num=10, find_unread="yes", read_flag="no"):
    """
    获取邮件消息，
    :param outlook_name: 读取邮箱，
    :param file_name: 读取文件夹，
    :param find_where: 筛选条件，
    :param find_num: 筛选数量，
    :param find_unread: 是否查询未读邮件，
    :param read_flag: 是否标记为已读，
    :return:邮件消息对象，
    """
    outlook, accounts, mapi = outlook_init()
    local_outlooks = mapi.Folders  # 根级目录（邮箱名称，包括Outlook读取的存档名称）
    mail_message_list = []
    find_num = int(find_num)
    for local_outlook in local_outlooks:
        # 只查找需要的邮箱账号信息
        if local_outlook.Name == outlook_name:
            local_files = local_outlook.Folders
            for_local_file(local_files, file_name, find_unread, find_where, find_num, read_flag,
                           mail_message_list,flag="get")
            print(len(mail_message_list))
            return outlook_key_num(mail_message_list)

def get_file_info(local_file,find_unread,find_where,find_num,read_flag,mail_message_list):
    mail_messages = local_file.Items
    mail_messages.Sort("[ReceivedTime]", True)
    print(len(mail_messages))
    if find_unread == "yes":
        mail_messages = mail_messages.Restrict("[Unread] = %s" % True)
    if find_where:
        mail_messages = mail_messages.Restrict("[SentOn] = '%s' "
                                               "or [Subject] = '%s' "
                                               "or [SenderName] = '%s' "
                                               "or [ReceivedTime] = '%s' "
                                               "or [To] = '%s' "
                                               "or [CC] = '%s' "
                                               % (
                                               find_where, find_where, find_where, find_where, find_where, find_where))
    for i in range(find_num):
        try:
            mail_message = mail_messages[i]
            if read_flag == "yes":
                mail_message.Unread = False  # 标记已读，
            mail_message_list.append(mail_message)
        except Exception as exc:
            print(exc)
            break

def for_local_file(local_files,file_name,find_unread,find_where,find_num,read_flag,mail_message_list,flag="get"):
    for local_file in local_files:
        if local_file.Name == file_name:
            if flag == "get":
                get_file_info(local_file, find_unread, find_where, find_num, read_flag, mail_message_list)
            else:
                for i in range(len(flag)):
                    flag[i].Move(local_file)
            # print(type(mail_messages))
        else:
            child = local_file.Folders
            if len(child) > 0:
                #递归所有文件，
                for_local_file(child, file_name, find_unread, find_where, find_num, read_flag,
                               mail_message_list,flag)

def outlook_reply(reply_content, reply_account, accept_file=None, reply_all_flag="no"):
    """
    回复邮件，
    :param reply_content: 回复的内容，
    :param reply_account: 回复的对象，
    :param accept_file: 回复的附件，
    :param reply_all_flag: 是否全部回复，
    :return:
    """
    reply_account = outlook_get_dict[reply_account]
    for i in range(len(reply_account)):
        if reply_all_flag == "no":
            mail_item = reply_account[i].Reply()
            mail_item.To = reply_account[i].SenderEmailAddress
        else:
            mail_item = reply_account[i].ReplyAll()
        if accept_file:
            accept_file_handle(mail_item, accept_file);
        #rec = mail_item.Recipients
        #rec[0].Address
        #reply_account[i].SenderEmailAddress
        mail_item.Body = reply_content
        mail_item.Send()
    return

def outlook_relay(relay_mail, relay_account):
    """
    邮件转发，
    :param relay_mail: 转发的邮件对象，
    :param relay_account: 转发的邮箱账号，
    :return:
    """
    relay_mail = outlook_get_dict[relay_mail]
    for i in range(len(relay_mail)):
        mail_item = relay_mail[i].Forward()
        mail_item.To = relay_account
        mail_item.Send()
    return

def outlook_move(outlook_name, file_name, move_mail):
    """
    移动邮件，
    :param outlook_name:邮箱账号，
    :param file_name:文件夹名称，
    :param move_mail:移动的邮件，
    :return:
    """
    outlook, accounts, mapi = outlook_init()
    local_outlooks = mapi.Folders  # 根级目录（邮箱名称，包括Outlook读取的存档名称）
    move_mail = outlook_get_dict[move_mail]
    for local_outlook in local_outlooks:
        # 只查找需要的邮箱账号信息
        if local_outlook.Name == outlook_name:
            local_files = local_outlook.Folders
            for_local_file(local_files, file_name, find_unread=None, find_where=None, find_num=None, read_flag=None,
                           mail_message_list=None,flag=move_mail)
    return

def test(xx):
    print(xx.SenderName)
    print(xx.Body)

if __name__ == '__main__':
    #C:\Users\shen\Desktop\智能测试\邮件发送附件
    #C:\Users\shen\Desktop\智能测试\1.xlsx
    #outlook_send("lbnkrxct@163.com","ces","123",send_name="luolixiang@rpaii.com",accept_file="C:\\Users\\shen\\Desktop\\1.jpg")
    #outlook_send("lbnkrxct@163.com","ces","123",accept_file="C:\\Users\\shen\\Desktop\\1.jpg")
    #outlook_send("lbnkrxct@163.com","ces","<h1>123</h1>")
    aa = outlook_get("lbnkrxct@139.com", "收件箱",find_num="3",find_unread="no",find_where="真最后一波测试，")
    print(aa)
    #aa = None
    #outlook_reply("测试下回复，",aa,reply_all_flag="yes",accept_file = r"C:\Users\shen\Desktop\智能测试\邮件发送附件")
    #outlook_relay(aa,"lbnkrxct@163.com")
    #outlook_move("lbnkrxct@139.com","收件箱",aa)
    # print(aa)
    # print(len(aa))
    # print(type(aa))
    # test(aa[0])