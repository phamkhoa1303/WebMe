// let rootStyle = document.documentElement.style;
// document.getElementById("toggle_darkmode").onclick = function (e){
//     if (document.getElementById("toggle_darkmode").checked == true){
//         rootStyle.setProperty("--darkmode-color",Colors.WhiteSmoke)
//     } else {
//         rootStyle.setProperty("--darkmode-color","#22201e")
//     }
// }

const body = document.querySelector('body'),
      sidebar = body.querySelector('nav'),
      toggle = body.querySelector(".toggle"),
      searchBtn = body.querySelector(".search-box"),
      modeSwitch = body.querySelector(".toggle-switch"),
      modeText = body.querySelector(".mode-text");


toggle.addEventListener("click" , () =>{
    sidebar.classList.toggle("close");
})

searchBtn.addEventListener("click" , () =>{
    sidebar.classList.remove("close");
})

modeSwitch.addEventListener("click" , () =>{
    body.classList.toggle("dark");
    
    if(body.classList.contains("dark")){
        modeText.innerText = "Light mode";
    }else{
        modeText.innerText = "Dark mode";
        
    }
});