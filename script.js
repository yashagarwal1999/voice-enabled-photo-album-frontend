

// USING API-KEY FOR API-GATEWAY AUTHENTICATION
var sdk = apigClientFactory.newClient({
  apiKey: "wcCEG844LT7uzze3bz37C40U45D1vSTq7a01OCH0",
});

function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  }
  

function uploadPhotos(){    
    event.preventDefault();    
    // OBTAINED IMAGE UPLOADED FROM HERE
    var image = document.getElementById('img').files[0]
    if (image){
      console.log("got image");
      var text = "It's alright! We'll label your photo after Uploading.."; //sameer paraphrase
      var customLabel = prompt(
        "Do you want to add a custom label to your photo?",
        "$"
      ); //sameer paraphrase
      if (customLabel) {
        text = "Uploading Successful!"; //sameer paraphrase
        // OBTAINED CUSTOM LABEL OF PHOTO HERE
        console.log(customLabel);
      }
      console.log(image);
      console.log(image.type);
      event.preventDefault();
      var encoded = getBase64(image).then((data) => {
        var img_base64 = data;
        console.log(img_base64);
        var params = {
          key: image.name,
          bucket: "bucket-for-photos-b2",
          "Content-Type": image.type + ";base64",
          "x-amz-meta-customLabels": customLabel,
        };
        console.log(params);
        console.log(sdk);
        // uploading the image to s3 bucket via api gateway
        sdk.uploadPut(params, img_base64, {}).then((response) => {
          console.log("Response:");
          console.log(response);
          console.log("Custom label sent - "); //sameer paraphrase
          console.log(customLabel);
        });
      });
    }else{
        console.log("No image selected");
        text = "Please Select an image to upload!"; 
    }
    
    document.getElementById('img').value = "";
    document.getElementById("convo").innerHTML = text;
    
}

function searchFunction(){    
    
    search_text = document.getElementById('search-bar').value;
    console.log("search_text = "+search_text);
    event.preventDefault();
    document.getElementById("convo").innerHTML = search_text;

}

function micFunction(){
    event.preventDefault();
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new window.SpeechRecognition();
    
    console.log(recognition)
    
    recognition.interimResults = true;
    recognition.addEventListener('result',(e) =>{
        console.log(e)
        const speechToText = Array.from(e.results).map(result => result[0]).map(result => result.transcript).join('');
        
        console.log(speechToText)
        document.getElementById('search-bar').value = speechToText;
        
        searchPhotos()
        setTimeout(continueExecution, 5000);

    })
    recognition.start();       
}

function continueExecution() {

}

function getLables(labels){
    array = labels.split(",");
    
    result = [];
    for (var i = 0; i < array.length; i++) {
      result += array[i]+"\n";
    }
    return result;
}

function searchPhotos(){
    event.preventDefault();
    
    search_text = document.getElementById('search-bar').value;
    if (search_text){
        console.log("search_text = "+search_text)
        event.preventDefault();
        var params = {"q" : search_text};
        var gallery_element = document.getElementById('photos');
        gallery_element.innerHTML = ''
        
        sdk.searchGet(params, {}, {}).then((response) => {
            event.preventDefault();
            console.log(response);
            var photos = response.data.body.results;
            console.log(photos)
            // console.log(photos)
            if (photos.length == 0){
                document.getElementById("convo").innerHTML = "No Photos found ";
                event.preventDefault();
            }else{
                console.log("no of pics:")
                console.log(photos.length);
                var num_pics = photos.length;
                document.getElementById("convo").innerHTML = num_pics+ " Photos found ";
                for(var i in photos){
                    console.log(photos[i]['labels']);
                    var label_desp = photos[i]['labels'].join();
                    console.log(label_desp);
                    console.log("COUNT = ")                 
                    console.log(i)
                    var div = document.createElement('div');
                    div.className = 'item'
                    if (num_pics==1){
                        div.style.width = '50%'
                    }
                    div.id = 'div_id'+i.toString()

                    let image_element = document.createElement('img');
                    image_element.src = photos[i]['url'];
                    console.log(photos[i]['url'])
                    image_element.className = 'item'
                    
                    console.log(image_element)
                    var category_element = document.createElement('h3');
                    category_element.textContent = getLables(label_desp);
                    console.log(getLables(label_desp));
                    category_element.id = "new-image"
                    category_element.width = "auto"

                    document.getElementById('photos').appendChild(div)        
                    document.getElementById(div.id).appendChild(image_element)
                    document.getElementById(div.id).appendChild(category_element)

                }
                document.getElementById('search-bar').value  = ''; 
                document.getElementById('convo').value  = '';                   
                   
            }    
        });    
    }else{
      console.log("search text is empty"); //sameer paraphrase
    }
   
}