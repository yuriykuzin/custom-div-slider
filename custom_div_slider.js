"use strict"

// Widget declaration

function CustomDivSlider(elem) {
  
  var sliderWidth, thumbHalfWidth, popupHalfWidth;  
  var slider = elem; 
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
  
  var sliderMax = Number(slider.dataset.max) || 100;
  var sliderValue = Math.min(Number(slider.dataset.value) || (sliderMax/2), sliderMax);
  
  thumbHalfWidth = thumb.clientWidth / 2;
  popupHalfWidth = sliderPopup.clientWidth / 2;
  
  renderPopupValue();
  window.addEventListener("resize", resizeSlider);
  resizeSlider();
  slider.focus();
  
  var clickOnTrackHandler = function(e) {
    sliderValue = Math.round((e.pageX - sliderTrack.getBoundingClientRect().left) * 
      sliderMax / sliderWidth);    
    renderValue();  
  }
  
  sliderTrackFilled.addEventListener("click", clickOnTrackHandler);
  sliderTrack.addEventListener("click", clickOnTrackHandler);
  thumb.addEventListener("click", function(e) {slider.focus();});
  
  thumb.addEventListener("mousedown", function(e) { 
    var mouseMoveHandler = function(e) {      
      sliderValue = Math.round((e.pageX - sliderTrack.getBoundingClientRect().left) * 
        sliderMax / sliderWidth);            
      sliderValue = Math.max(0, (Math.min(sliderValue, sliderMax)));
      renderValue();
      e.preventDefault();      
    }    
    var mouseUpHandler = function() {      
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
    };    
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);        
  });
  
  var touchStartThumbOrPopupHandler = function(e) {    
    if (e.changedTouches.length === 1) {            
      var touchMoveHandler = function(e) {        
        if (e.changedTouches.length === 1) {          
          sliderValue = Math.round((e.targetTouches[0].pageX - 
            sliderTrack.getBoundingClientRect().left) * sliderMax / sliderWidth);
          sliderValue = Math.max(0, (Math.min(sliderValue, sliderMax)));
          renderValue();
          e.preventDefault();      
        }
      }                
      window.addEventListener("touchmove", touchMoveHandler);            
      var touchEndHandler = function() {
        window.removeEventListener("touchmove", touchMoveHandler);
        window.removeEventListener("touchend", touchEndHandler);        
      };
      window.addEventListener("touchend", touchEndHandler);
    }    
  };
  
  thumb.addEventListener("touchstart", touchStartThumbOrPopupHandler);
  sliderPopup.addEventListener("touchstart", touchStartThumbOrPopupHandler);
  
  slider.addEventListener("keydown", function(e) { 
    if ((e.keyCode === 38 || e.keyCode === 39) && sliderValue < sliderMax) {
      sliderValue++;      
      e.preventDefault();
    } else if ((e.keyCode === 37 || e.keyCode === 40) && sliderValue > 0) {
      sliderValue--;     
      e.preventDefault();      
    }
    renderValue();    
  });
  
  function renderValue() {
    renderThumbPosition();
    renderPopupValue();
  }  
   
  function resizeSlider() {
    sliderWidth = sliderTrack.clientWidth;
    renderThumbPosition();
  }
  
// Generates "popupvaluechange" event 
  
  function renderPopupValue() {
    sliderPopup.innerHTML = String(sliderValue).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ") + " $"; 
    var event = new CustomEvent("popupvaluechange", {
      detail: { value: sliderValue }
    });
    elem.dispatchEvent(event);
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
    },
    set: function(val) {
      sliderValue = val;
      renderValue();      
    }
  });  
  
  this.addEventListener = function() {
    return slider.addEventListener(arguments[0], arguments[1], arguments[2], arguments[3]);
  }  
}

//  Polyfill for CustomEvent in IE9+

try {
  new CustomEvent("IE has CustomEvent, but doesn't support constructor");
} catch (e) {

  window.CustomEvent = function(event, params) {
    var evt;
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };
    evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };

  CustomEvent.prototype = Object.create(window.Event.prototype);
}