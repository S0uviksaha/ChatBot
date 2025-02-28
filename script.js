let prompt_Input = document.querySelector("#prompt");
let chat_container = document.querySelector(".chat-container");
let img_btn = document.querySelector("#image");
let img_input = img_btn.querySelector("#image-input");
let img_preview = img_btn.querySelector("#image-preview");
let img_icon = img_btn.querySelector("#image-icon");
let submit_btn = document.querySelector("#submit");

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBPM0cI6DB6iguppc0DsXFhLprWFYFSpy8";

let user = {
    history: [],
    file:{
        mime_type: null,
        data: null,
    }
};

function createChatBox(html,classes){
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;

}

function formatResponseText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/_(.*?)_/g, "<i>$1</i>")
        .replace(/\n{2,}/g, "\n")
        .trim();
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area"); 
    let requestOption = {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body:JSON.stringify({
            contents: user.history.map(chat =>({
            role: chat.role === "user" ? "user" : "model",
            parts: [{ text: chat.text }, (user.file.data? [{"inline_data": user.file}] : []),
        ]
            }))
       })
    };
    try{
        let response = await fetch(API_URL,requestOption);
        let data = await response.json();
        console.log(data);
        if (data.candidates && data.candidates.length > 0){
            let API_response = data.candidates[0].content.parts[0].text;
            API_response = formatResponseText(API_response);
            console.log(API_response);
            text.innerHTML = API_response.replace(/\n/g, "<br>");
            user.history.push({ role: "model", text: API_response });
        }
        else {
            text.innerHTML = "⚠️ Error: No response from AI.";
        }
    }
    catch(err){
        console.log(err);
        text.innerHTML = "⚠️ Error: Could not get a response.";
    }
    finally{
        setTimeout(() => {
            chat_container.scrollTo({
                top: chat_container.scrollHeight,
                behavior: "smooth"
            });
            img_icon.src = `./image/image icon.png`;
            img_icon.classList.remove("choose");
            user.file = {
                mime_type: null,
                data: null,
            };
        }, 100);
    };
}

function handleChatResponse(message){
    user.history.push({
        role: "user",
        text: message,
    });
    let html = `<img src="./image/user_icon.png" alt="user-image" id="user-image" class="img">
        <div class="user-chat-area">
        ${message}
        ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" alt="user-image" class="user-image">` : ""}
        </div>`;
    let userChatBox = createChatBox(html,"user-chatbox");
    chat_container.appendChild(userChatBox);
    chat_container.scrollTo({
        top:chat_container.scrollHeight,
        behavior:"smooth"});
    setTimeout(() => {
        let html = `<img src="./image/ai_chatbot_icon.png" alt="AI-image" id="ai-image" class="img">
            <div class="ai-chat-area"><img src="./image/loading.gif" alt="loading ..." class="loading"></div>`;
        let aiChatBox = createChatBox(html,"ai-chatbox");
        chat_container.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 500);
};

prompt_Input.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
        handleChatResponse(prompt_Input.value);
        prompt_Input.value = "";
    }
});

submit_btn.addEventListener("click",()=>{
    handleChatResponse(prompt_Input.value);
        prompt_Input.value = "";
});

img_input.addEventListener("change",()=>{
    console.log(img_input.files);
    if(img_input.files.length==0){
        return;
    }
    let img_file = img_input.files[0];
    console.log(img_file);
    let reader = new FileReader();
    reader.onload = (e)=>{
        console.log(e);
        let bade64String = e.target.result.split(",")[1];
        user.file = {
            mime_type : img_file.type,
            data : bade64String,
        }
        img_icon.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        img_icon.classList.add("choose");
    };
    reader.readAsDataURL(img_file);
}
);

img_btn.addEventListener("click", ()=>{
    img_input.click();
    console.dir(img_input);
    
})