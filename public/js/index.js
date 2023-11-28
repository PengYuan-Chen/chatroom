var socket = io('http://127.0.0.1:3000')
//儲存這個用戶的名稱頭像
var username;
var avatar;

//選擇頭像
$('.avatar li').on('click', function () {
    $(this)
        .addClass('now')
        .siblings()
        .removeClass('now')
})
//登入點擊事件
$('.login-btn').on('click', () => {
    var username = $('#username').val().trim()
    if (!username) {
        alert('請輸入暱稱')
        return
    }
    var avatar = $('.avatar .now img').attr('src')
    socket.emit('login', {    //觸發login事件回傳名稱圖片
        username: username,
        avatar: avatar
    })
})
//註冊事件(接收)
socket.on('loginError', data => {
    alert('暱稱已存在')
})
//登入成功處理
socket.on('loginSucess', data => {
    $('.login').fadeOut()    //登入成功切換頁面
    $('#chat').fadeIn()
    //設置個人名稱頭像
    $('.person').html(data.username)
    $('.person-img').attr('src', data.avatar)
    username=data.username
    avatar=data.avatar
})
//通知新加用戶消息
socket.on('addUser', data => {
    $('.main').append(`<h3 class="system">${data.username}加入聊天室</h3>`)
    $('.system:last')[0].scrollIntoView(false)
})
//聊天室人數，用戶列表
socket.on('userList', data => {
    $('.person-count').html(data.length)    //人數
    $('.person-list').html(' ')    //舊的資料要清空不然會一直往上加
    data.forEach(item => {    //跑users陣列渲染畫面
        $('.person-list').append(`
        <div class="my">
        <img src="${item.avatar}" >
        <span>${item.username}</span>
        </div>`)
    });
})
//離開聊天室
socket.on('removeUser', data => {
    $('.main').append(`<h3 class="system">${data.username}離開聊天室</h3>`)
    $('.system:last')[0].scrollIntoView(false)    //任何訊息都要先顯示
})
//發送聊天
$('.btn-send').on('click', () => {
    //1.把內容都給服務器
    //2.服務器向用戶廣播
    var content = $('#text-area').val()
    if(content==' '){
        alert('請輸入訊息')
        return
    }
    socket.emit('chat', {username,avatar,content})
    $('#text-area').val(' ')
})
//接收聊天內容
socket.on('addChat', data => {
    //判斷是自己還是別人
    if(username==data.username){
        $('.main').append(`
        <div class="talk me-talk">
            <div class="word"><span>${data.content}</span></div>
            <img id="main-img" src="${data.avatar}" alt="">
        </div>`)
    }else{
        $('.main').append(`
        <div class="talk other-talk">
            <div class="word"><span>${data.content}</span></div>
            <img id="main-img" src="${data.avatar}" alt="">
        </div>`)
    }
    //讓div大小隨著對話框變大
    $('.talk:last').css('height',$('.word:last').css('height'))
    //讓畫面會出現在最下面，jq先轉dom元素
    $('.talk:last')[0].scrollIntoView(false)
})
//圖片上傳功能
$('#file').on('change',()=>{
    var file = $('#file').get(0).files[0];
    var fr=new FileReader()
    fr.readAsDataURL(file)
    fr.onload=function(){
        socket.emit('sendImage',{username,avatar,img:fr.result})
    }
})
//接收圖片
socket.on('receiveImage', data => {
    if(username==data.username){
        $('.main').append(`
        <div class="talk me-talk">
            <div id="Img-show"><img id="showImg" src=${data.img}></div>
            <img id="main-img" src="${data.avatar}" alt="">
        </div>`)
    }else{
        $('.main').append(`
        <div class="talk other-talk">
            <div id="Img-show2"><img id="showImg" src=${data.img}></div>
            <img id="main-img" src="${data.avatar}" alt="">
        </div>`)
    }
    $('.talk:last').css('height',$('#showImg:last').css('height'))
    $('.talk:last')[0].scrollIntoView(false)
})