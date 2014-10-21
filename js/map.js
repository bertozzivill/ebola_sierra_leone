


//////////////////
///SETUP
//////////////////

	//Projections, locate things on page
		var settings = {width: document.getElementById('full_page').clientWidth,
						height: document.getElementById('full_page').clientWidth,
						padding: 70}

		// Set map projection
			 var center = d3.geo.centroid(topojson.feature(shape, shape.objects.SLE_adm2))
			 var map_scale  = 11000;
			 var projection = d3.geo.equirectangular().scale(map_scale).center(center)
			          .translate([settings.width/2, settings.height/4]);

				// Set path generator -- how coordinates translate into a path element
				var path = d3.geo.path().projection(projection)

		//generate main SVG, smaller G which will contain the actual map, and title G
			var full_svg = d3.select('#full_page').append('svg')
						.attr('width', settings.width)
						.attr('height', settings.height)
						.attr('id', 'full-svg')

			var map_g = d3.select('#full-svg')
						 .append('g')
						 .attr('id', 'map-g')
						 .attr('transform', 'translate(0,' +  settings.padding + ')')

			var title = d3.select('#full-svg')
				.append('text')
				.attr('class', 'label')
				.attr('id', 'mapTitle')
				.attr('transform', 'translate(' + (settings.width/4) + ',' + settings.padding + ')')
				.text('Ebola Cases in Sierra Leone as of 08.15.14, by District')

//Setup for plotting: get dictionaries and scales set up

	//make a few mappings: district id to name, and name to case count (from two separate datasets)
		//match district names to ids
			var id_name_map = {}
			id_names.map(function(d) {id_name_map[d.id] = d.District})

		//match district to case count
			var formattedData = {}
			data.map(function(d) {formattedData[d.District] = d.Cases})

		//get min and max of case data for color scale
			var values = d3.keys(data).map(function(d) {return data[d].Cases})
			var min = d3.min(values)
			var max = d3.max(values)

		//make color scale: this will correspond to the shade of the district on the map
			var color_scale = d3.scale.linear().range(['white', 'red']).domain([min, max])

		//function to geta district name from a district id, used in color plotting
			var district_map = function(d,i) {return id_name_map[i]}

//////////////////
///PLOTTING
//////////////////
	//plot outlines of districts
		var paths = map_g.selectAll('path')
			.data(topojson.feature(shape, shape.objects.SLE_adm2).features).enter()
			.append('path')
			.attr('id', function(d,i) {return 'id-'+i} )
			.attr('district', function(d,i) {return id_name_map[i]})
			.attr('class', 'border border--district')
			.attr('fill', '#d3d3d3')
			.attr("stroke", "#000")
			.attr('d', path)

	//fill in color
		paths.attr('fill', function(d,i){
			var district = district_map(d,i)
			var value = formattedData[district]
			var color = color_scale(value)
			return color
		})

	//mouseover text: list name of province and number of cases so far
		$('#map-g path').poshytip({
			alignTo: 'cursor', // Align to cursor
			followCursor: true, // follow cursor when it moves
			showTimeout: 0, // No fade in
			hideTimeout: 0,  // No fade out
			alignX: 'center', // X alignment
			alignY: 'inner-bottom', // Y alignment
			className: 'tip-twitter', // Class for styling
			offsetY: 10, // Offset vertically
			slide: false, // No slide animation
			content: function(d, i){
				var obj = this.__data__ // Data associated with element
				var name = $(this).attr('district') // Name from properties
				var cases = formattedData[name] // iso3
				//mean = data[iso3] == undefined ? '' : data[iso3].mean // Value
				return name + ' : ' + cases + ' Cases' // String to return
			}
		})