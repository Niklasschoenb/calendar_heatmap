define("transcanada_viz_ext_calendarheatmap-src/js/render", [], function() {
	/*
	 * This function is a drawing function; you should put all your drawing logic in it.
	 * it's called in moduleFunc.prototype.render
	 * @param {Object} data - proceessed dataset, check dataMapping.js
	 * @param {Object} container - the target d3.selection element of plot area
	 * @example
	 *   container size:     this.width() or this.height()
	 *   chart properties:   this.properties()
	 *   dimensions info:    data.meta.dimensions()
	 *   measures info:      data.meta.measures()
	 */
	var render = function(data, container) {

		// Data related var init	
//		var format = d3.time.format("%Y-%m-%d");
		var format = d3.time.format("%-m/%-d/%Y");

		var meta = data.meta;
		var dims = meta.dimensions("X Axis");
		var Y_measure = meta.measures("Y Axis")[0];

		var minDate = d3.min(data, function(d) {
				return new Date(d[dims[0]]);
			}),
			maxDate = d3.max(data, function(d) {
				return new Date(d[dims[0]]);
			});

		var minYear = minDate.getFullYear(),
			maxYear = maxDate.getFullYear();

		// graph related var init
		var height = this.height();
		var width = this.width();
		// width is about 54 (weeks) x cell size + 2 cell size (for the year label), 
		// and height is about (7 (days per week) + yearGap (2)) x cell size x # of years => 9 x cell size
		var cellSize = (width / 56) < (height / ((maxYear - minYear + 1) * 9)) ? (width / 56) : (height / ((maxYear - minYear + 1) * 9));
		cellSize = cellSize < 12 ? 12 : cellSize;

		var yearHeight = cellSize * 7;

		//prepare canvas with width and height of container
		container.selectAll("svg").remove();
		var vis = container.append("svg").attr("width", this.width()).attr("height", this.height())
			.append("g").attr("class", "vis").attr("width", this.width()).attr("height", this.height());

		var bar = vis.selectAll("g")
			.data(d3.range(minYear, maxYear+1)) // right end is exclusive
			.enter().append("g")
			.attr("class", "RdYlGn")
			.attr("transform", function(d, i) {
				return "translate(" + 20 + "," + i * (yearHeight + 10) + ")";
			});

		// Labels of years
		bar.append("text")
			.attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
			.style("text-anchor", "middle")
			.text(function(d) {
				return d;
			});

		var rect = bar.selectAll(".day")
			.data(function(d) {
				return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
			})
			.enter().append("rect")
			.attr("class", "day")
			.attr("width", cellSize)
			.attr("height", cellSize)
			.attr("x", function(d) {
				return d3.time.weekOfYear(d) * cellSize;
			})
			.attr("y", function(d) {
				return d.getDay() * cellSize;
			})
			.datum(format);

		rect.append("title")
			.text(function(d) {
				return d;
			});

		bar.selectAll(".month")
			.data(function(d) {
				return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
			})
			.enter().append("path")
			.attr("class", "month")
			.style("stroke-width", 1)
			.attr("d", monthPath);

		var minValue = d3.min(data, function(d) {
				return d[Y_measure];
			}),
			maxValue = d3.max(data, function(d) {
				return d[Y_measure];
			});

		var colorScheme = d3.scale.quantize()
//		.domain([(minValue * 3 - maxValue) / 2, (maxValue * 3 - minValue) / 2])  //option to mild scheme
		.domain([minValue, maxValue])
		.range(["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"]);
//		.range(["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"]);
//		.range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);
//		.range(["#FFFFFF","#E5E8EF","#CCD1E0","#B2BAD0","#99A3C1","#7F8CB1","#6675A2","#4C5E92","#334783","#193073","#001964"]);

		var data1 = d3.nest()
			.key(function(d) {
				return (new Date(d[dims[0]])).getTime();
			})
			.rollup(function(d) {
				return d[0][Y_measure] * 1.0;
			})
			.map(data);

		rect.filter(function(d) {
			return (new Date(d)).getTime() in data1;
		})
			.style("fill", function(d) { return colorScheme(data1[(new Date(d)).getTime()]); })
			.select("title")
			.text(function(d) {
				return d + ": " + data1[(new Date(d)).getTime()];
			});

		function monthPath(t0) {
			var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
				d0 = t0.getDay(),
				w0 = d3.time.weekOfYear(t0),
				d1 = t1.getDay(),
				w1 = d3.time.weekOfYear(t1);
			return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V" + (d1 +
				1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1) * cellSize + "Z";
		}
		/*

*/
	};

	return render;
});