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
		var format = d3.time.format("%Y-%m-%d");

		var meta = data.meta;
		var dims = meta.dimensions("X Axis");
		var Y_measure = meta.measures("Y Axis")[0];

		var minDate = d3.min(data, function(d) {
				return d[dims[0]];
			}),
			maxDate = d3.max(data, function(d) {
				return d[dims[0]];
			});
		//console.log(maxDate);
		var minYear = parseInt(minDate.substr(0, 4)),
			maxYear = parseInt(maxDate.substr(0, 4));

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
			.data(d3.range(minYear, maxYear))
			//.data(d3.range(1990, 2011))
			.enter().append("g")
			.attr("class", "RdYlGn")
			.attr("transform", function(d, i) {
				return "translate(" + 20 + "," + i * (yearHeight + 10) + ")";
			});

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

		var color = d3.scale.quantize()
			.domain([(minValue * 3 - maxValue) / 2, (maxValue * 3 - minValue) / 2])
			//    .domain([minValue, maxValue])
			//.domain([1000, 4000])
			.range(d3.range(11).map(function(d) {
				return "q" + d + "-11";
			}));

		var colorScheme = d3.scale.quantize()
//		.domain([(minValue * 3 - maxValue) / 2, (maxValue * 3 - minValue) / 2])
		.domain([minValue, maxValue])
		.range(['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d']);
//		.range(['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081']);


		var data1 = d3.nest()
			.key(function(d) {
				return d[dims[0]];
			})
			.rollup(function(d) {
				return d[0][Y_measure] * 1.0;
			})
			.map(data);

		rect.filter(function(d) {
			return d in data1;
		})
//			.attr("class", function(d) { return "day " + color(data1[d]); })
			.style("fill", function(d) { return colorScheme(data1[d]); })
			.select("title")
			.text(function(d) {
				return d + ": " + data1[d];
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