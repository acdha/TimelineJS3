/*  VCO.AxisHelper
    Strategies for laying out the timenav
    markers and time axis
    Intended as a private class -- probably only known to TimeScale
================================================== */
VCO.AxisHelper = VCO.Class.extend({
    initialize: function (options) {
		if (options) {
            this.scale = options.scale;
	        this.minor = options.minor;
	        this.major = options.major;
		} else {
            throw("Axis helper must be configured with options")
        }
       
    },
    
    getPixelsPerTick: function(pixels_per_milli) {
        return pixels_per_milli * this.minor.factor;
    },

    getMajorTicks: function(timescale) {
		return this._getTicks(timescale, this.major)
    },

    getMinorTicks: function(timescale) {
        return this._getTicks(timescale, this.minor)
    },

    _getTicks: function(timescale, option) {

        var factor_scale = timescale._scaled_padding * option.factor;
        var first_tick_time = timescale._earliest - factor_scale;
        var last_tick_time = timescale._latest + factor_scale;
        var ticks = []
        for (var i = first_tick_time; i < last_tick_time; i += option.factor) {
            ticks.push(timescale.getDateFromTime(i).floor(option.name));
        }

        return {
            name: option.name,
            ticks: ticks
        }

    }

});

(function(cls){ // add some class-level behavior

    var HELPERS = {};
    
    var setHelpers = function(scale_type, scales) {
        HELPERS[scale_type] = [];
        
        for (var idx = 0; idx < scales.length - 1; idx++) {
            var minor = scales[idx];
            var major = scales[idx+1];
            HELPERS[scale_type].push(new cls({
                scale: minor[3],
                minor: { name: minor[0], factor: minor[1]},
                major: { name: major[0], factor: major[1]}
            }));
        }
    };
    
    setHelpers('javascript', VCO.Date.SCALES);
    setHelpers('cosmological', VCO.BigDate.SCALES);
    
    cls.HELPERS = HELPERS;
    
    cls.getBestHelper = function(ts,optimal_tick_width) {
        if (typeof(optimal_tick_width) != 'number' ) {
            optimal_tick_width = 100;
        }
        var ts_scale = ts.getScale();
        var helpers = HELPERS[ts_scale];
        
        if (!helpers) {
            throw ("No AxisHelper available for "+ts_scale);
        }
        
        var prev = null;
        for (var idx in helpers) {
            var curr = helpers[idx];
            var pixels_per_tick = curr.getPixelsPerTick(ts._pixels_per_milli);
            if (pixels_per_tick > optimal_tick_width)  {
                if (prev == null) return curr;
                var curr_dist = Math.abs(optimal_tick_width - pixels_per_tick);
                var prev_dist = Math.abs(optimal_tick_width - pixels_per_tick);
                if (curr_dist < prev_dist) {
                    return curr;
                } else {
                    return prev;
                }
            }
            prev = curr;
        }
        return helpers[helpers.length - 1]; // last resort           
    }
})(VCO.AxisHelper);
