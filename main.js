function generateCharts(){
    var numberFormat = d3.format(",.0f");	
    airlineEmissionChart = dc.barChart('#dc-airline-emission');
    airlineBubbleChart = dc.bubbleChart('#dc-airline-bubble');
    airlineDistanceChart = dc.barChart('#dc-airline-distance');
    airlineCompositeChart = dc.compositeChart('#dc-airline-compositeLine');
    dataTable = dc.dataTable("#dc-table-graph");
   
    var tier1Limit = 5717 * 1000;
    var tier2Limit = 27301 * 1000;
    var tier3Limit = 60983 * 1000;
    var tier1Value =($("#tier1 :selected").val());
    var tier2Value = ($("#tier2 :selected").val());
    var tier3Value = ($("#tier3 :selected").val());
    var tier4Value = ($("#tier4 :selected").val());
    
    //count inconsistent (0) for the count not needed
    //color hardcode for bubblechart in dc.js
    //put legend for dc.js 
     d3.csv('final.csv',function(data){
        //read the csv file
        var emissionArray = [];
        var distanceArray = [];
        var profitArray = [];
        var taxArray = [];
        //var airlineKeyArray = [];
        var airlineDistanceMap = {};
        var airlineEmissionMap = {};
        var airlineProfitMap = {};
        
        data.forEach(function(d){
            d.airlineName = d.Airline_Unique_Name;
            d.airlineKey = d.Airline_Iata_Faa;
            d.profit = Math.round(+(d.Total_Op_Profit_Loss_2013)) * 1000;
            d.distance = Math.round(+(d.Total_Distance_In_Km));
            d.emission = Math.round(+(d.Total_Emission)) * 1000;
            d.tax = 0;
            if (d.emission < tier1Limit){
                d.tax = tier1Value * d.emission;
            }else if(d.emission < tier2Limit){
                d.tax = tier2Value * d.emission;
            }else if(d.emission < tier3Limit){
                d.tax = tier3Value * d.emission;
            }else{
                d.tax = tier4Value * d.emission;
            }
            d.afterTax = d.profit - d.tax;
            d.ratio = +(d.emission / d.distance);
            taxArray.push(d.tax);
            emissionArray.push(d.emission);
            distanceArray.push(d.distance);
            profitArray.push(d.profit);
            //For the count 
            airlineDistanceMap[d.airlineKey] = d.distance;
            airlineEmissionMap[d.airlineKey] = d.emission;
            airlineProfitMap[d.airlineKey] = d.profit;
           
        });
      
        var facts = crossfilter(data);
        var all = facts.groupAll();
        
        function getMaxProfit() {
            var maxProfit = d3.max(data, function (d) {
                return d.profit;
            });
            return maxProfit;
        }
        function getMinProfit(){
             var minProfit = d3.min(data, function (d) {
                return d.profit;
            });
            return minProfit;
          
        }
        function getMaxEmission() {
            var maxEmission = d3.max(data, function (d) {
                return d.emission;
            });
            return maxEmission;
        }
        function getMinEmission() {
             var minEmission = d3.min(data, function (d) {
                return d.emission;
            });
            return minEmission;
        }
        function getMaxTax() {
            var maxTax = d3.max(data, function (d) {
                return d.tax;
            });
            return maxTax;
        }
        function getMinTax() {
            var minTax = d3.min(data, function (d) {
                return d.tax;
            });
            return minTax;
        }
        function getMaxDistance() {
            var maxDistance = d3.max(data, function (d) {
                return d.distance;
            });
            return maxDistance;
        }
        function getMinDistance() {
            var minDistance = d3.min(data, function (d) {
                return d.distance;
            });
            return minDistance;
        }
        function getMinAfterTax(){
             var minAfterTax = d3.min(data, function (d) {
                return d.afterTax;
            });
            return minAfterTax;
        }
        function getMaxAfterTax(){
            var maxAfterTax = d3.max(data, function (d) {
                return d.afterTax;
            });
            return maxAfterTax;
        }
        function getMinRatio(){
            var minRatio = d3.max(data, function (d) {
                return d.ratio;
            });
            return minRatio;
        }
        function getMaxRatio(){
            var maxRatio = d3.max(data, function (d) {
                return d.ratio;
            });
            return maxRatio;
        }
        
        var bubbleDimension = facts.dimension(function(d){return d.airlineKey;});
        var bubbleGroup = bubbleDimension.group().reduce(
            function(p,v){
                
                p.distance = p.distance + v.distance;
                p.emission = p.emission + v.emission;
                p.tax = p.tax + v.tax;
                p.afterTax = p.afterTax + v.afterTax;
                p.profit = p.profit + v.profit;
                p.count = p.count + 1;
                p.ratio = p.ratio + v.ratio;
                p.total += v.total;
                return p;
            },
            function (p,v){
                
                p.distance = p.distance - v.distance;
                p.emission = p.emission - v.emission;
                p.tax = p.tax - v.tax;
                p.afterTax = p.afterTax - v.afterTax;
                p.profit = p.profit - v.profit;
                p.count = p.count - 1;
                p.ratio = p.ratio - v.ratio;
                p.total -= v.total;
                return p;
            },
            function(){
                
                return {
                    distance:0,
                    emission:0,
                    tax:0,
                    afterTax:0,
                    profit:0,
                    count:0,
                    ratio:0,
                    total:0
                };
            }    
        );
        emissionArray = crossfilter.quicksort(emissionArray,0,emissionArray.length);
        distanceArray = crossfilter.quicksort(distanceArray,0,distanceArray.length);
        profitArray = crossfilter.quicksort(profitArray,0,profitArray.length);
        
        //sort the distance domain in descending order
        var airlineDistanceDomain = [];
        var sortable = [];
        for (var airlineKey in airlineDistanceMap)
            sortable.push([airlineKey, airlineDistanceMap[airlineKey]]);
            sortable.sort(function(a, b) {return b[1] - a[1]});
        for (var i = 0 ; i < 43 ; i++){
          
           airlineDistanceDomain.push(sortable[i][0]);
        }
        
        //sort the emission domain in descending order
        var airlineEmissionDomain = [];
        var sortable1 = [];
        for (var airlineKey in airlineEmissionMap)
            sortable1.push([airlineKey, airlineEmissionMap[airlineKey]]);
            sortable1.sort(function(a, b) {return b[1] - a[1]});
        for (var i = 0 ; i < 43 ; i++){
          
           airlineEmissionDomain.push(sortable1[i][0]);
        }
        //sort the emission in descending order previous method
        //var sortByEmission = crossfilter.quicksort.by(function(d){return -d.emission;});
        //var sortByEmissionData = sortByEmission(data,0,data.length);
        
        var fakeDimension = facts.dimension(function(d){return d.airlinKey;});
        
        var airlineDistanceDimension = facts.dimension(function(d){return d.airlineKey;});
        var airlineDistanceGroup = airlineDistanceDimension.group().reduceSum(function(d){return d.distance;});
        
        var airlineEmissionDimension = facts.dimension(function(d){return d.airlineKey;});
        var airlineEmissionGroup = airlineEmissionDimension.group().reduceSum(function(d){return d.emission;});
       
        var airlineProfitDimension = facts.dimension(function(d){return d.airlineKey;});
        var airlineProfitGroup = airlineProfitDimension.group().reduceSum(function(d){return d.profit;});
        
        var airlineTaxDimension = facts.dimension(function(d){return d.airlineKey;});
        var airlineTaxGroup = airlineTaxDimension.group().reduceSum(function(d){return d.tax;});
        
        var airlineAfterTaxDimension = facts.dimension(function(d){return d.airlineKey;});
        var airlineAfterTaxGroup = airlineAfterTaxDimension.group().reduceSum(function(d){return d.afterTax;});
        
        function plotAirlineCount(){
            airlineCount = dc.numberDisplay('#dc-airline-count');
            airlineCount.group(airlineEmissionGroup).valueAccessor(function(d){return airlineEmissionDimension.top('Infinity').length;}).formatNumber(d3.format(".0f"));
        }
        function plotDistanceCount(){
            distanceCount = dc.numberDisplay('#dc-distance-count');
            var distanceSum = 0;
            var airlineArray =[];
           
            distanceCount.group(bubbleGroup).valueAccessor(function(d){
                airlineArray = airlineEmissionDimension.top('Infinity');
               
                for (var i =0 ; i < airlineArray.length; i++){
                    distanceSum += (airlineDistanceMap[airlineArray[i].airlineKey]);
               
                };
                return distanceSum;
            });
        }
        function plotEmissionCount(){
            emissionCount = dc.numberDisplay('#dc-emission-count');
            var emissionSum = 0;
            var airlineArray = [];
            emissionCount.group(bubbleGroup).valueAccessor(function(d){
                airlineArray = airlineEmissionDimension.top('Infinity');
               
                for (var i=0; i <airlineArray.length; i++){
                    emissionSum += (airlineEmissionMap[airlineArray[i].airlineKey]);
                }
                return emissionSum;
            });
        }
        function plotProfitCount(){
            profitCount = dc.numberDisplay('#dc-profit-count');
            var profitSum = 0;
            var airlineArray = [];
            profitCount.group(bubbleGroup).valueAccessor(function(d){
                airlineArray = airlineEmissionDimension.top('Infinity');
                for (var i=0; i <airlineArray.length; i++){
                    profitSum += (airlineProfitMap[airlineArray[i].airlineKey]);
                }
                return profitSum;
            });
        }
        
        airlineEmissionChart.width(990)
                .height(300)
                .margins({top: 10, right: 10, bottom: 40, left: 70})
                .dimension(airlineEmissionDimension)
                .xUnits(dc.units.ordinal)
                .group(airlineEmissionGroup)
                .transitionDuration(10)
                .xAxisLabel('Airlines') 
                .yAxisLabel('Emission / Tonnes')
                .renderHorizontalGridLines(true)
                .renderTitle(false)
                //.title(function (d) {
                    //return  d.key + ": " + d.value;
                //})
                .colors(d3.scale.ordinal().domain(["0-25", "26-50", "51-75", "75-100"]).range(colorbrewer.Reds[4]))
                .colorAccessor(function (d) {
                    if (d.value < emissionArray[10]) {
                        return "0-25";
                    } else if (d.value < emissionArray[21]) {
                        return "26-50";
                    } else if (d.value < emissionArray[32]) {
                        return "51-75";
                    }
                    return "75-100";
                })
                 .barPadding(0.05)
                .outerPadding([1])
                .x(d3.scale.ordinal().domain(airlineEmissionDomain))
                .elasticY(true)
                 .renderlet(function(chart){
                    
                    chart.selectAll(".bar").call(barTip);
                        chart.selectAll(".bar").on("mouseover", barTip.show)
                                .on("mouseleave", barTip.hide);
                    }) 
                .xAxis().tickFormat();
        //airlineEmissionChart.onClick = function() {};
        //plot airline distance chart
         var barTip = d3.tip()
                        .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function (d) {
                        return "<span style='color: #c6dbef'>" + d.data.key + "</span> : " + numberFormat(d.y)
                     
                    });
       var bubbleTip = d3.tip()
                        .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function (d) {
                        return "<span style='color: #c6dbef'> Airline </span> : " + d.key+"<br>"+
                               "<span style='color: #c6dbef'> Profit </span> : $" + numberFormat(d.value.profit) + "<br>"+
                               "<span style='color: #c6dbef'> Emission </span> : " + numberFormat(d.value.emission) + "<br>"+
                               "<span style='color: #c6dbef'> Distance </span> : " + numberFormat(d.value.distance) + "<br>"+
                               "<span style='color: #c6dbef'> Emission / Distance Ratio</span> : " + Math.round(d.value.ratio) ;
                    });
        
        airlineDistanceChart.width(990)
            .height(300)
            .margins({top: 10, right: 0, bottom: 40, left:70})
            .dimension(airlineDistanceDimension)
            .group(airlineDistanceGroup)
            .transitionDuration(10)
            .xAxisLabel('Airlines') 
            .yAxisLabel('Distance / Km')
            .renderHorizontalGridLines(true)
            .renderTitle(true)
            .title(function (d) {
                return  d.key + ": " + d.value;
            })
            .barPadding(0.05)
            .outerPadding([1])
             .x(d3.scale.ordinal().domain(airlineDistanceDomain))
            .xUnits(dc.units.ordinal)
            .colors(d3.scale.ordinal().domain(["0-25", "26-50", "51-75", "75-100"]).range(['rgb(255,255,212)','rgb(254,217,142)','rgb(254,153,41)','rgb(204,76,2)']))
            .colorAccessor(function (d) {
                    if (d.value < distanceArray[10]) {
                        return "0-25";
                    } else if (d.value < distanceArray[21]) {
                        return "26-50";
                    } else if (d.value < distanceArray[32]) {
                        return "51-75";
                    }
                    return "75-100";
            })
            .renderlet(function(chart){
                   
                    chart.selectAll(".bar").call(barTip);
                        chart.selectAll(".bar").on("mouseover", barTip.show)
                                .on("mouseleave", barTip.hide);
                    }) 
             
            .elasticY(true)
            .xAxis().tickFormat();
            
        //plot the bubble chart x,y domain not fixed yet
         airlineBubbleChart
            .width(990) 
            .height(500)  
            .margins({top: 10, right: 10, bottom: 40, left: 70})
            .dimension(bubbleDimension)
            .group(bubbleGroup)
            .colors(d3.scale.ordinal().domain(["0","1","2","3","4","5","6","7","8"]).range(colorbrewer.RdYlGn[9])) 
            //.colorDomain([getMinProfit(), getMaxProfit()]) 
            .colorAccessor(function (d) {
                if (d.value.profit < profitArray[5]){
                    return "0";
                }else if(d.value.profit < profitArray[10]){
                    return "1";
                }else if(d.value.profit < profitArray[15]){
                    return "2";
                }else if(d.value.profit < profitArray[20]){
                    return "3";
                }else if(d.value.profit < profitArray[25]){
                    return "4";
                }else if(d.value.profit < profitArray[30]){
                    return "5";
                }else if(d.value.profit < profitArray[35]){
                    return "6";
                }else if(d.value.profit < profitArray[40]){
                    return "7";
                }else{
                    return "8";
                }
                
                  
            })
            .keyAccessor(function (d) {
                return d.value.distance;
            })
            .valueAccessor(function (d) {
                return d.value.emission;
            })
            .radiusValueAccessor(function (d) {
                return d.value.ratio;
            })
            .maxBubbleRelativeSize(1)
            .x(d3.scale.linear().domain([getMinDistance(), getMaxDistance()]))
            .y(d3.scale.linear().domain([getMinEmission(), getMaxEmission()]))
            .r(d3.scale.linear().domain([0,1000]))
            .yAxisPadding(200000000)
            .xAxisPadding(5000000)
            .elasticX(true)
            .elasticY(true)
            .renderHorizontalGridLines(true) 
            .renderVerticalGridLines(true) 
            .xAxisLabel('Distance / Km') 
            .yAxisLabel('Emission / Tonnes') 
            .renderLabel(true) 
            .label(function (p) {
                return p.key;
            })
            .renderTitle(false) 
            .title(function(d){
                return d.key+": "+"Profit: "+d.value.profit;
            })
           .renderlet(function(chart){
                    
                    chart.selectAll(".bubble").call(bubbleTip);
                        chart.selectAll(".bubble").on("mouseover", bubbleTip.show)
                                .on("mouseleave", bubbleTip.hide);
                    }) 
             
            
            
        airlineProfitChart = dc.lineChart(airlineCompositeChart)
            .group(airlineProfitGroup,"Pre-Tax Profit")
            .renderDataPoints({radius:3})
            .colors("#3182bd");
           
        airlineTaxChart = dc.lineChart(airlineCompositeChart)
             .group(airlineTaxGroup,"Tax")
            .renderDataPoints({radius:3})
            .colors("#e6550d");
            
        airlineAfterTaxChart = dc.lineChart(airlineCompositeChart)
            .group(airlineAfterTaxGroup,"Post-Tax Profit")
            .renderDataPoints({radius:3})
            .colors("#2ca25f");
            
        airlineCompositeChart
                .width(990)
                .height(300)
                .margins({top: 10, right: 10, bottom: 40, left: 80})
                .dimension(fakeDimension)
                .x(d3.scale.ordinal().domain(data.map(function (d) {return d.airlineKey;}).sort()))
                .xUnits(dc.units.ordinal)
                .yAxisLabel("USD")
                .xAxisLabel("Airlines")
                .yAxisPadding(200000)
                 .renderVerticalGridLines(true)
                .renderHorizontalGridLines(true)
                .renderlet(function(chart){
                     chart.selectAll("g.x text")
                      .attr('dx', '-10');
                
                })
                .elasticY(true)
                .compose([airlineProfitChart,airlineTaxChart,airlineAfterTaxChart])
                .legend(dc.legend().x(220).y(280).itemWidth(95).legendWidth(600).horizontal(true))
       
        dataTable.width(990)
             .height(300)
             .dimension(airlineEmissionDimension)
             .group(function(){
                return "";
             })
             .size(10)
             .columns([
                function(d) {
                    return   d.airlineKey;
                },
                 function(d) {
                    return   d.airlineName;
                },
               
                function(d) {
                    return  "$"+numberFormat(d.profit);
                },
                function(d) {
                    return "$"+numberFormat(d.tax);
                },
                function(d){
                    return "$"+numberFormat(d.afterTax);
                },
                function(d){
                    return numberFormat(d.emission);
                },
                function(d) {
                    return numberFormat(d.distance);
                },
                ])
                .sortBy(function(d) {
                        return d.emisson;
                })
                .order(d3.ascending);
        
        
        
        
        //bind the event
        airlineEmissionChart.on('filtered',function(){
            plotAirlineCount();
            plotDistanceCount();
            plotEmissionCount();
            plotProfitCount();
            dc.redrawAll();
        });
        
        /*airlineDistanceChart.on('filtered',function(){
            plotAirlineCount();
            plotDistanceCount();
            plotEmissionCount();
            plotProfitCount();
            dc.redrawAll();
        });*./
        
        airlineBubbleChart.on('filtered',function(){
            plotAirlineCount();
            plotDistanceCount();
            plotEmissionCount();
            plotProfitCount();
            dc.redrawAll();
        });
        
        /*dc.dataCount('.dc-data-count')
            .dimension(facts)
            .group(all);*/
      
        plotAirlineCount();
        plotDistanceCount();
        plotEmissionCount();
        plotProfitCount();
        dc.renderAll();
         
        
    });
    
    
    
}

