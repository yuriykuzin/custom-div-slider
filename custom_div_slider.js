"use strict"

// Widget declaration:

function CustomDivSlider(options) {
  
  var sliderValue, sliderMax, sliderWidth, thumbHalfWidth, popupHalfWidth;
  
  var slider = options.elem; 
  var fragment = document.createDocumentFragment();  
  var sliderPopup = document.createElement('div');
  sliderPopup.className = "custom-div-slider__popup";  
  var sliderTrack = document.createElement('div');
  sliderTrack.className = "custom-div-slider__track";
  var sliderTrackFilled = document.createElement('div');
  sliderTrackFilled.className = "custom-div-slider__track-filled";
  var thumb = document.createElement('div');
  thumb.className = "custom-div-slider__thumb";
  
  fragment.appendChild(sliderPopup);  
  fragment.appendChild(sliderTrack);
  fragment.appendChild(sliderTrackFilled);
  fragment.appendChild(thumb);
  slider.appendChild(fragment);
  
  sliderValue = +slider.getAttribute("value");  
  sliderMax = +slider.getAttribute("max");
  
  if (sliderMax === 0 || isNaN(sliderMax)) sliderMax = 100;
  if (isNaN(sliderValue)) sliderValue = Math.round(sliderMax / 2);
  
  thumbHalfWidth = parseFloat(getComputedStyle(thumb).width)/2;
  popupHalfWidth = parseFloat(getComputedStyle(sliderPopup).width)/2;
  sliderPopup.innerHTML = String(sliderValue).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ") + " $";  

  sliderTrackFilled.onclick = sliderTrack.onclick = function(e) {
    sliderValue = Math.round((e.pageX - sliderTrack.getBoundingClientRect().left) * 
      sliderMax / sliderWidth);    
    renderValue();  
  }
  
  thumb.onmousedown = function(e) {    
    document.onmousemove = function(e) {
      sliderValue = Math.round((e.pageX - sliderTrack.getBoundingClientRect().left) * 
        sliderMax / sliderWidth);            
      if (sliderValue < 0) {
        sliderValue = 0;
      } else if (sliderValue > sliderMax) {
        sliderValue = sliderMax;
      }      
      renderValue();
    }
    document.onmouseup = function() {
      document.onmousemove = document.onmouseup = null;
    };
    return false; // disable selection start 
  };
  
  thumb.ontouchstart = function(e) {    
    if (e.changedTouches.length === 1) {      
      thumb.ontouchmove = function(e) {
        if (e.changedTouches.length === 1) {          
          sliderValue = Math.round((e.targetTouches[0].pageX - 
            sliderTrack.getBoundingClientRect().left) * sliderMax / sliderWidth);
          if (sliderValue < 0) {
            sliderValue = 0;
          } else if (sliderValue > sliderMax) {
            sliderValue = sliderMax;
          }      
          renderValue();
        }
      }               
      
      document.ontouchend = function() {
        document.ontouchmove = document.ontouchend = null;
      };
    }
    return false; 
  };
  
  slider.onkeydown = function(e) {
    if ((e.keyCode === 38 || e.keyCode === 39) && sliderValue < sliderMax) {
      sliderValue++;      
    } else if ((e.keyCode === 37 || e.keyCode === 40) && sliderValue > 0) {
      sliderValue--;      
    }
    renderValue();
  }
  
  window.addEventListener("resize", resizeSlider);
  resizeSlider();
  slider.focus();
  
  function renderValue() {
    renderThumbPosition();
    sliderPopup.innerHTML = String(sliderValue).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ") + " $";      
  }  
   
  function resizeSlider() {
    sliderWidth = parseFloat(getComputedStyle(sliderTrack).width);       
    renderThumbPosition();
  }
  
  function renderThumbPosition() {
    thumb.style.left = sliderValue * sliderWidth / sliderMax - thumbHalfWidth + "px";
    sliderTrackFilled.style.width = sliderValue * sliderWidth / sliderMax + "px";    
    sliderPopup.style.left = sliderValue * sliderWidth / sliderMax - (popupHalfWidth-2) + "px";        
  } 

//  Public methods:  
  
  Object.defineProperty(this, "value", {
    get: function() {
      return sliderValue;
    }
  });
  
  this.setValue = function(val) {
    sliderValue = val;
    renderValue();      
  }
}



