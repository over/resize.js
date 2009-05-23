// Copyright (c) 2009 Mikhail Tabunov

var Resizable = Class.create({
	initialize: function(element, options) {
		if (!options) options = {}
		var defaultOptions = {
			minHeight: 0,
			minWidth: 0,
			snap: [0, 0],
			zindex: 1000,
			onStart: null,
			onEnd: null
		}
		
		Object.extend(defaultOptions, options)
		
		this.options = defaultOptions
		
		this.element = $(element)

		this.element.insert('\
			<div class="corner corner-lt" style="left:-5px; top: -5px;"></div>\
			<div class="corner corner-rt" style="right: -5px; top: -5px;"></div>\
			<div class="corner corner-lb" style="left: -5px; bottom: -5px;"></div>\
			<div class="corner corner-rb" style="right: -5px; bottom: -5px;"></div>\
		')
		
		this.element.select("div.cornet").invoke("absolutize")
		
		this.handle = this.element
		this.element.makePositioned()
		this.registerEvents()
	},
	
	destroy: function() {
		this.element.select(".corner").invoke("stopObserving", "mousedown")
	},
	
	registerEvents: function() {
		this.element.select(".corner").each(function(e) {
			e.observe("mousedown", function(event) {
				this.startResize(event)
				this.addFinishEvents()
				
				$$('body')[0].observe("mousemove", function(event) {
					this.draw(event)
				}.bind(this))
			}.bind(this))
			
		}.bind(this))
	},
	
	addFinishEvents: function() {
		$$("body")[0].observe("mouseup", function(event) {
			this.finishResize(event)
			
			this.removeFinishEvents()
			$$('body')[0].stopObserving("mousemove")
		}.bind(this))
	},
	
	removeFinishEvents: function() {
		$$("body")[0].stopObserving("mouseup")	
	},
	
	startResize: function(event) {
		if(Event.isLeftClick(event)) {
			if (this.options.onStart) this.options.onStart(this, event)
			
			this.updateCachedPosition()
			
			this.startX = Event.pointerX(event),
			this.startY = Event.pointerY(event)
			
			this.hand = event.findElement("div.corner")
			Event.stop(event)
		}
	},
	
	finishResize: function(event) {
		if (this.options.onEnd) {
			this.options.onEnd(this)
		}
	},

	updateCachedPosition: function() {
		this.coordinates = { 
			width: this.element.getWidth(), 
			height: this.element.getHeight(), 
			left: parseInt(this.element.getStyle("left")), 
			top: parseInt(this.element.getStyle("top"))
		}
	},
	
	draw: function(event) {
		currentPosition = {
			x: Event.pointerX(event),
			y: Event.pointerY(event)
		}
		
		
		newWidth = 0
		newHeight = 0
		newLeft = 0
		newTop = 0
		
		diffX = this.startX - currentPosition.x
		diffY = this.startY - currentPosition.y
		
		if (this.hand.hasClassName("corner-rb")) {
			
			newWidth = this.coordinates.width - diffX
			newHeight = this.coordinates.height - diffY
			newTop = this.coordinates.top
			newLeft = this.coordinates.left
			
		} else if (this.hand.hasClassName("corner-lb")) {
			
			newWidth = this.coordinates.width + diffX
			newHeight = this.coordinates.height - diffY
			newTop = this.coordinates.top
			newLeft = this.coordinates.left - diffX
			
		} else if (this.hand.hasClassName("corner-lt")) {
			
			newWidth = this.coordinates.width + diffX
			newHeight = this.coordinates.height + diffY
			newTop = this.coordinates.top - diffY
			newLeft = this.coordinates.left - diffX
			
		} else if (this.hand.hasClassName("corner-rt")) {
			
			newWidth = this.coordinates.width - diffX
			newHeight = this.coordinates.height + diffY
			newTop = this.coordinates.top - diffY
			newLeft = this.coordinates.left
			
		}
		
		if (!this.isSetSnap()) {
			newHeight = this.snappedValue(1, newHeight)
			newWidth = this.snappedValue(0, newWidth)
			newTop = this.snappedValue(1, newTop)
			newLeft = this.snappedValue(0, newLeft)
		}
		
		if (newHeight > this.options.minHeight && newWidth > this.options.minWidth) {
			this.element.setStyle({
				height: newHeight +'px',
				width: newWidth + 'px',
				left: newLeft + 'px',
				top: newTop + 'px'
			})
		}
	},
	
	isSetSnap: function() {
		if (this.options.snap[0] == 0 && this.options.snap[1] == 0) return true
	},
	
	snappedValue: function(index, value) {
 		return (value / this.options.snap[index]).round() * this.options.snap[index]
	}
})
