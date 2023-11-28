//express中用socket.io
const express=require('express')
const { dirname } = require('path')
const app=express()
var server=require('http').Server(app)
const io=require('socket.io')(server)
//紀錄已登入用戶
const users=[]

server.listen(3000,()=>{
    console.log('啟動')
})
//靜態資源根目錄
app.use(express.static(__dirname+'/public'))

app.get('/',(req,res)=>{
    res.redirect('index.html')    //顯示某檔案
})
//每次連接用戶都會有一個socket對象
io.on('connection',socket=>{
    console.log('新用戶連接')
    socket.on('login',data=>{
        //去查找這個用戶是否有登入過
        var user=users.find(item=>item.username === data.username)
        if(user){
            //用戶已存在-登入失敗(觸發事件傳給client)
            socket.emit('loginError')
        }else{
            //用戶不存在-登入成功
            users.push(data)
            socket.emit('loginSucess',data)               
            //廣播消息所有人
            io.emit('addUser',data)
            io.emit('userList',users)
            socket.username=data.username
            socket.avatar=data.avatar
        }
    })
    //聊天
    socket.on('chat',data=>{
        io.emit('addChat',data)  
    })
    //圖片
    socket.on('sendImage',data=>{
        io.emit('receiveImage',data)
    })

    //用戶斷開連接('disconnect事件(不是自訂義)')
    socket.on('disconnect',()=>{
        var pos=users.findIndex(item=>socket.username==item.username)
        users.splice(pos,1)    //刪除users
        io.emit('removeUser',{   //離開消息
            username:socket.username,
            avatar:socket.avatar
        })
        io.emit('userList',users)    //跑列表
    })
})