//创建/销毁
Create	        创建实例，常用于实例化方法和工厂方法的命名	                       CreateInstance
Initialize	    初始化实例的属性和设置，Initialize本身也可作为类方法用来初始化	   InitializeInstance, Initialize
Load	        加载配置，根据配置创建内容	                                      LoadFromConfig
Destroy	        销毁实例，常用语析构方法	                                      DestroyInstance
Uninitialize	清理实例的属性和设置，通常和Initialize对应	                      UninitializeInstance, Uninitialize

//获取/设置
Get	            常用于取属性的类方法命名，也可作为通用获取方法命名	               GetStartTime
Fetch	        通过网络请求获取内容	                                         FetchAllUsers
Calculate	    通过计算获取内容	                                             CalculateTotalAmount
Read	        读取(多用于文件，配置等)	                                     ReadFile, ReadConfig
Query	        查询	                                                        QueryRemainingAmount
Find	        查找(多用于数据库，集合等), 和search相似	                     FindOrder
Receive	        接收(多用于文件，消息等)	                                     ReceiveNewMessage
Pull	        拉取	                                                        PullLastestSourceCode
Set	            常用于设置属性的类方法命名，也可作为通用设置方法命名	          SetStartTime
Write	        写入(文件 / 配置等)	                                            WriteFile, WriteConfig
Put	            放入	                                                        PutUserWithId
Push	        存入, 推送(通知)	                                            PushNotification

1.从数据结构获取：get
2.通过计算获取：calculate / cal
3.数据库获取：find / query
4.从配置文件获取：load / parse / build
5.从网络获取：fetch

//更新
Reset	        强调重置(标记, 状态)	                                        ResetTimer
Refresh	        用于命名刷新(多用于页面, 缓存等)	                            RefreshCurrentPage
Update	        更新(多用于配置，状态等)	                                    UpdateUserSetting

//添加/移除
Add	            用于通用添加方法命名	                                        AddNewStudent
Append	        强调在尾部添加(追加)	                                        AppendCharacter
Insert	        强调插入(可以在任意位置)	                                    InsertCharacter
Delete	        表示删除, 和Remove相近	                                        DeleteDirectory
Remove	        表示移除, 和Delete相近	                                        RemoveInvalidDeals

//启动/停止
Open	        开启(多用于开启状态, 打开文件等)	                            OpenEnhanceMode
Start	        开始(强调开始某个流程)	                                        StartPortListening
Launch	        发动 / 启动(多用于启动程序, 服务)	                            LaunchAssistService
Close	        关闭(多用于关闭状态, 关闭文件等)	                            CloseEnhanceMode
Stop	        停止(强调流程的终止)	                                        StopPortListening
Pause	        暂停(强调流程的暂停，有可能后续会继续开启)	                    PausePageLoading
Finish	        完成(强调流程的完成)	                                        FinishRequesting

