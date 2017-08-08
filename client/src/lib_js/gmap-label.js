// Define the overlay, derived from google.maps.OverlayView
function Label(opt_options) {
    // Initialization
    this.setValues(opt_options);

    // Label specific
    var span = this.span_ = document.createElement('span');
    var cssText = 'position: relative; left: -50%; top: -8px; ' +
        'white-space: nowrap;' +
        'padding: 2px;';

    cssText += 'background-color: ' + (opt_options.hasOwnProperty('bgcolor') ? opt_options['bgcolor'] + ';color: white;' : 'white;color:black;');

    span.style.cssText = cssText;

    var div = this.div_ = document.createElement('div');
    div.appendChild(span);
    div.style.cssText = 'position: absolute; display: none';
};

Label.prototype = new google.maps.OverlayView();

// Implement onAdd
Label.prototype.onAdd = function () {
    var pane = this.getPanes().floatPane;
    pane.appendChild(this.div_);

    // Ensures the label is redrawn if the text or position is changed.
    var me = this;
    this.listeners_ = [
        google.maps.event.addListener(this, 'position_changed',
            function () {
                me.draw();
            }),
        google.maps.event.addListener(this, 'text_changed',
            function () {
                me.draw();
            })
    ];
};

// Implement onRemove
Label.prototype.onRemove = function () {
    var i, I;
    this.div_.parentNode.removeChild(this.div_);

    // Label is removed from the map, stop updating its position/text.
    for (i = 0, I = this.listeners_.length; i < I; ++i) {
        google.maps.event.removeListener(this.listeners_[i]);
    }
};

// Implement draw
Label.prototype.draw = function () {
    var projection = this.getProjection();

    if (!projection) return;

    var position = projection.fromLatLngToDivPixel(this.get('position'));

    var div = this.div_;
    div.style.left = position.x + 'px';
    div.style.top = position.y + 'px';
    div.style.display = 'block';

    this.span_.innerHTML = this.get('text').toString();
};

Label.prototype.setContent = function (txt) {
    this.set('text', txt);
    this.draw();
};
