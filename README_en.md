# II-RPA
		hello world

#### II-RPA：Infinite intelligence RPA，人力有限，而智慧无穷，

#### RPA Introduce，
		Process robot is a software program that simulates human to make logical judgment and operation. It combines the application of artificial intelligence to realize the automation of workflow, which is mainly composed of two parts,

		One part is the operation ability of software application, which simulates the operation of software and hardware by human;

		The other part is the ability of artificial intelligence, which simulates human for semantic recognition, image recognition and logical judgment.

		Through the combination of two parts of capabilities, process robot assists human to complete complex business processes on application system.

		Generally speaking, a process robot can be used to implement a series of functions of crawler, automatic office and automatic operating system by dragging windows and inputting information in a code free manner,

		All the repetitive and large amount of work that has to be operated on the computer every day can be automatically completed with this work,

#### Install

		1、node_modules download，
		   1、https://cloud.189.cn/t/ueuERniuYVny (pwd:6q3z)，
		   2、https://pan.baidu.com/s/1-R1UIRr70Cd27ruHJ5ZTbA ，pwd：h1j9 

		2、manual install node_modules
		   1、npm install --global windows-build-tools， 
		   2、python27 environment variable，
		   3、cd python27\Lib\site-packages, create sitecustomize.py，and input
				# encoding='GBK' 
		      import sys  
		      reload(sys)  
		      sys.setdefaultencoding('GBK')  
		   4、npm install -g node-gyp， 
		   5、cd /npm/，create binding.gyp， and input
		      { 
		        "targets": [ 
		          {
		            "target_name": "binding", 
		            "sources": [ "src/binding.cc" ] 
		          } 
		        ] 
		      } 
		   6、npm config edit， and input
		      electron_mirror=https://npm.taobao.org/mirrors/electron/
		   7、node-gyp configure，
		   8、https://github.com/nodejs/node-gyp#on-windows Download and install 'Visual Studio Build Tools'， 
		   9、cd / ,create src dir，cd src，create binding.cc， 
		   10、https://cmake.org/download/, Download and install 'cmake'， 
		   11、cmake environment variable， 
		   12、admin-powershell Set-ExecutionPolicy RemoteSigned -Scope CurrentUser,
		   13、git config --global http.postBuffer 88880000， 
		   14、git config --global http.sslVerify "false"， 
		   15、npm config edit， and input
		      node_sqlite3_binary_host_mirror=http://npm.taobao.org/mirrors 
		   16、'opencv' You can comment it out first
		   17、npm install

#### Usage
		cnpm start
![启动图](./readme_iamge/start.png)
		ok

#### Language
		./interiorConfig/properties.json, attribute : "i18n":"en" //English   "i18n":"cn" //Chinese

#### Test RPA-Files
		./rpa测试流程文件/*.rpa
		
#### Technical framework
		Html+Electron+Nodejs+python

#### Project structure directory

		Package.json------Module description file，
		Webpack.config.js------Webpack Execution profile，
		Main.js------js Entry，
		Obfuscator.js------Javascript Code compression and obfuscation，
		gulpfile.js------Front end automation building tool，
		node_modules------Dependent directory，
		interiorConfig，
		   menu.json------Configuration component menu，
		   properties.json------Default configuration, shortcut key, global waiting time, Chinese and English, version number, log 							directory, timeout, remote port,,,
		   version.json------Version information，
		extend------Extension component directory，
			python------python，
		config------i18n-International configuration，
		build------Build directory，
		app------Project directory，
		css------css，
		img------img，
		main------main，
		pages------Static page,
		renderer------Rendering，
		tool------Tool，
		   uiautomation------Uispy，
		   log------Logs，
		renderer.js------Electron，

#### Screenshot

![介绍图](./readme_iamge/remarks.png)     
![执行图](./readme_iamge/run.png)     

#### Follow up plan，

		1、Component development

#### RPA Official Website,

		Official website address：http://rpaii.com/index.html
			
		Comprehensive intelligent official website is the network portal of Comprehensive Intelligent Technology Co., Ltd. Based on the user's point of view, the official website answers the questions about what RPA is and what RPA can bring to us. On this basis, it introduces in detail the AI and other technical advantages and characteristics of all intelligent Tianxing RPA, and provides a platform for RPA learning and communication.

		The solution module of the official website lists the actual application scenarios of RPA for users based on our rich project experience in the past, which is divided into three types: industry, general purpose and individual, so that users can have a more specific understanding of the RPA.

		The comprehensive intelligent official website RPA academy module provides users with typical application scenarios of learning and projects of various basic entry functions in the form of video.

		The comprehensive intelligent official website supports the community module, and builds an open and shared RPA communication community, which is convenient for users to feed back various problems encountered in the use. We will reply your questions and needs as soon as possible.

		Comprehensive intelligent official website provides an open platform for users to understand RPA, learn RPA and share RPA experience, so as to promote the continuous optimization and improvement of comprehensive intelligence, and strive to provide better and more stable services for users.

#### Rpa Brief Introduction，

		Intelligent Tianxing (process automation robot) realizes the automation of workflow by simulating human for logical judgment, and reading and operating any software application system.

		The designer provides the ability of process design and arrangement, the actuator provides the ability of task execution, and the control center is the centralized control and management platform for robots and task execution.

		The first is the ability of software application operation, which can realize the high applicable simulated human to operate software and hardware. The second is the ability of artificial intelligence, which can simulate human to carry out semantic recognition, image recognition, logical judgment and so on. Through the combination of two parts of capabilities, it can assist human to complete complex business processes on the application system.

		The product value of all intelligent Tianxing

		1. Improve work efficiency: realize 7 * 24 hours work, all year round;

		2. Improve the quality of work: avoid human error, the accuracy of processing to reach 100%;

		3. Control enterprise cost: reduce labor or outsourcing cost by 50-60%;

		4. Safety compliance: each task step can be monitored and recorded;

		5. Scalability and flexibility: drag and drop process design, convenient for users to deploy quickly.

		Technical advantages of all intelligent Tianxing

		1. Full component process engine technology

		2. End to end robot cluster control technology

		3. Multimodal interface cognitive technology

		4. Asynchronous automatic execution technology

		5. Multi process exception handling technology

		6. Intelligent extraction technology

		7. Visual processing technology

#### Email，
		Email：opensource@rpaii.com