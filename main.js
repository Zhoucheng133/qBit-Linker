// ==UserScript==
// @name         qBit Linker
// @version      0.0.1
// @description  蜜柑计划/nyaa添加到qBit任务脚本
// @author       zhouc
// @match        *://mikanime.tv/*
// @match        *://mikanani.me/*
// @match        *://acgrip.art/*
// @match        *://nyaa.si/*
// @match        *://www.dmhy.org/*
// @match        *://bangumi.moe/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
  .qbit-linker-button:hover{
    background-color: #039761;
  }
  .qbit-linker-button {
    background-color: #04AA6D;
    border: none;
    color: white;
    padding: 5px 10px;
    text-align: center;
    text-decoration: none;
    font-size: 13px;
    border-radius: 10px;
    transition: background-color linear .2s;
    cursor: pointer;
    margin-left: 8px;
  }
`);

(function () {
  // 修改下面的qBit地址和qBit密钥
  const qbit = "http://...";
  const username = "";
  const password = "";

  async function getCookie(){
    await new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url: `${qbit}/api/v2/auth/login`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: `username=${username}&password=${password}`,
        onload: function (response) {
          resolve(response);
        },
        onerror: reject
      });
    });
  }

  async function downloadHanlder(url) {
    await getCookie();
    GM_xmlhttpRequest({
      method: "POST",
      url: `${qbit}/api/v2/torrents/add`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: `urls=${encodeURIComponent(url)}`,
      onload: function (response) {
        if (response.status === 200) {
          alert("任务已添加至 qBittorrent!");
        } else {
          alert(`请求失败: ${response.status}`);
        }
      },
      onerror: function () {
        alert("请求失败！检查服务器连接状态和脚本中配置信息");
      }
    });
  }

  function buttonHandler(element, url){
    const btn = document.createElement('button');
    btn.innerText = '下载';
    btn.style.marginLeft = '8px';
    btn.className = 'qbit-linker-button';
    btn.addEventListener('click', () => {
      downloadHanlder(url);
    });
    element.parentNode.insertBefore(btn, element.nextSibling);
  }

  function mikanHandler(){
    document.querySelectorAll('a').forEach(a => {
      if (a.innerText.includes('复制')){
        if (a.nextElementSibling && a.nextElementSibling.classList.contains('qbit-linker-button')) {
          return;
        }
        const url=a.getAttribute('data-clipboard-text');
        buttonHandler(a, url);
      }
    })
  }

  function nyaaHandler(){
    document.querySelectorAll('a').forEach(a=>{
      if (a.href.startsWith("magnet:?")){
        if (a.nextElementSibling && a.nextElementSibling.classList.contains('qbit-linker-button')) {
          return;
        }
        const url = a.href;
        buttonHandler(a, url);
      }
    })
  }

  function acgripHandler(){
    document.querySelectorAll('a').forEach(a=>{
      if(a.href.includes("torrent")){
        document.querySelectorAll('.action').forEach(e=>{
          e.style.width='90px';
        })
        if (a.nextElementSibling && a.nextElementSibling.classList.contains('qbit-linker-button')) {
          return;
        }
        const url = a.href;
        buttonHandler(a, url);
      }
    })
  }

  function dmhyHanlder(){
    const element=document.querySelector("#a_magnet");
    if(element){
      if (element.nextElementSibling && element.nextElementSibling.classList.contains('qbit-linker-button')) {
        return;
      }
      const url=element.innerText;
      buttonHandler(element, url);
    }
  }

  function moeHandler(){
    document.querySelectorAll('a').forEach(a=>{
      if(a.href.startsWith("magnet:?")){
        if (a.nextElementSibling && a.nextElementSibling.classList.contains('qbit-linker-button')) {
          return;
        }
        const url=a.href;
        buttonHandler(a, url);
      }
    })
  }

  let observer = new MutationObserver(scriptHandler);

  function scriptHandler() {
    observer.disconnect();
    if(location.hostname.includes("mikan")){
      mikanHandler();
    }else if(location.hostname.includes("nyaa")){
      nyaaHandler();
    }else if(location.hostname.includes("acgrip")){
      acgripHandler();
    }else if(location.hostname.includes("dmhy")){
      dmhyHanlder();
    }else if(location.hostname.includes("bangumi.moe")){
      moeHandler();
    }
    observer.observe(document.body, { childList: true, subtree: true });
  }

  scriptHandler();
})();
