define(['app', 'window', 'jquery', 'funnel', 'WdatePicker', 'chart', 'dataToChartConfig', 'filters', 'projectShowServices', 'toastr'], function (app, w, $) {
	//console.dir(app);
	app.register.controller('ProjectShowController', ['$location', '$modal', '$filter', '$scope', '$rootScope', '$state', '$interval', '$timeout', 'util', 'charts', 'dataToChartConfig', 'projectShowServices', 'toastr', function ($location, $modal, $filter, $scope, $rootScope, $state, $interval, $timeout, util, charts, dataToChartConfig, projectShowServices, toastr) {

		$scope.initializeController = function () {
			//成交分布默认初始显示区域，当显示城市列表时候变成"city"，当现实项目列表时候变成"project" 成交分布后面的返回按钮会根据这个值去做显示隐藏
			$scope.showDealType = "area"
			$scope.loaded = false; //默认未加载数据
			//把区域列表数据跟城市列表数据记录下来，方便下钻后点击返回
			$scope.areasDate = {};
			$scope.citiesDate = {};
			//获取界面数据
			$scope.getData();
			
			$scope.projectShow();
		}
		
		
		$scope.projectShow = function(){
			projectShowServices.projectShow({}, function(response, status){
				//全部项目
				$scope.projComplete = response.data.rptProjComplete;
				//住宅项目
				$scope.projHouse = response.data.rptProjHouse;
				//商业项目
				$scope.projBusiness = response.data.rptProjBusiness;
				//置业项目
				$scope.rptProjProperties = response.rptProjProperties;
				$scope.rptZyStoreRank = response.data.rptZyStoreRank;
				$scope.rptZyProjRentSale =  response.data.rptZyProjRentSale;
				//住宅销售
				$scope.projSale = response.data.rptResidentialSale;
				//项目排行top3
				$scope.bProjSum = response.data.bProjSum;
				//客户漏斗数据
				var clients = [
						["到访阶段", response.data.rptResidentialSale.visit_number],
				        ["认筹阶段", response.data.rptResidentialSale.recognition_number],
				        ["认购阶段", response.data.rptResidentialSale.subscribe_number],
				        ["签约阶段", response.data.rptResidentialSale.contract_numner]
					];
				//填充客户漏斗图
				$scope.chartConfig1 = $scope.toFunnelData("客户数", clients);
				//住宅销售转化率
				
				/*1.visit_reco_num|visit_cst_num   访转筹人数/到访客户数
				2.recognition_subs_num|confess_cst_num 筹转购人数/认筹客户数
				3.visit_subscribe_num|visit_cst_num  访转购人数/到访客户数
				4.subs_contract_num|subscribe_cst_num   购转签人数/认购客户数
				5.visit_contract_num|visit_cst_num   访转签人数/到访客户数
				*/ 

				if(response.data.rptResidentialSale.visit_cst_num==0){
					$scope.data01 =(0).toFixed(2);
				}else{
					$scope.data01 = ((response.data.rptResidentialSale.visit_reco_num/response.data.rptResidentialSale.visit_cst_num)*100).toFixed(2);
				}
				
				if(response.data.rptResidentialSale.confess_cst_num==0){
					$scope.data02 =(0).toFixed(2);
				}else{
					$scope.data02 = ((response.data.rptResidentialSale.recognition_subs_num/response.data.rptResidentialSale.confess_cst_num)*100).toFixed(2);
				}
				
				if(response.data.rptResidentialSale.visit_cst_num==0){
					$scope.data03 =(0).toFixed(2);
				}else{
					$scope.data03 = ((response.data.rptResidentialSale.visit_subscribe_num/response.data.rptResidentialSale.visit_cst_num)*100).toFixed(2);
				}
				
				if(response.data.rptResidentialSale.subscribe_cst_num==0){
					$scope.data04 =(0).toFixed(2);
				}else{
					$scope.data04 = ((response.data.rptResidentialSale.subs_contract_num/response.data.rptResidentialSale.subscribe_cst_num)*100).toFixed(2);
				}

				if(response.data.rptResidentialSale.contract_cst_num==0){
					$scope.data05 =(0).toFixed(2);
				}else{
					$scope.data05 = ((response.data.rptResidentialSale.visit_contract_num/response.data.rptResidentialSale.visit_cst_num)*100).toFixed(2);
				}
				
				
				//获取成交分布数据,且设置成交分布图标
				$scope.setDealTable(response.data.deal);
				//保存区域列表数据
				$scope.areasDate = response.data.deal;  
				
				//填充成交客户特征
				$scope.customerFeature = response.data.customerFeature;
				 
				
			}, function(response, status){
				toastr.warning('获取数据失败', '提示', {
					closeButton: true,
					timeOut: 5000
				});
			})
		}
		
		
		//获取界面数据
		$scope.getData = function(){
			projectShowServices.getData({}, function(response, status){
				$scope.loaded = true;//表示已经成功加载数据
				
				//填充成交客户特征
				$scope.customerFeature = response.customerFeature;

				/*//获取成交分布数据,且设置成交分布图标
				//console.log(response.deal);
				$scope.setDealTable(response.deal);

				//保存区域列表数据
				$scope.areasDate = response.deal;*/
				

			}, function(response, status){
				toastr.warning('获取数据失败', '提示', {
					closeButton: true,
					timeOut: 5000
				});
			})
		}

		//转成漏斗数据格式
		$scope.toFunnelData = function(title, data){
			return {
				"options": {
					"chart": {
						"type": "funnel"
					},
					"title": {
						"text": null
					},
					/*tooltip: {
			        	enabled: false
			        },*/
					colors:['#27a9e3', '#28b779', '#fa9507', '#8356ab'],
				},
				"series": [
					{
			            name: title,
			            tooltip: {
				        	enabled: false
				        },
				        dataLabels: {
				        	enabled: false
				        },
			            data: data
			        }
				],
				"size": {
					"height": "280"
				},
				"credits": {
					"enabled": false
				}

			}
		}

		//console.dir(projectShowServices);

		//生成成交分布图标
		$scope.setDealTable = function(deal){
			//console.dir(deal);
			//var deal = response.deal;
			//对deal里的data数据添加点击事件
			angular.forEach(deal.data, function(item, index){
				item.events = {
					click: function(event){
						//console.log(event);
						event.preventDefault();
						if(this.type == "project"){
							//如果是project，点击则直接跳转到项目详情
							$state.go('app.project.details', {"projectId":this.id});
							return false;
						}
						//获取下钻列表的成交分布
						$scope.getDeal(this.id, this.type);
					}
				}
			});
			//return false;
			$scope.chartConfigObj2 = {
				categories: deal.categories,
				data: deal.data,
				height: 280,
				yTitle: "成交金额(万)"
			}
			$scope.chartConfig2 = charts.column5($scope.chartConfigObj2);
		}



		//获取下钻列表的成交分布
		$scope.getDeal = function(id, type){

			var $loading = $("<div class='chart-loading'>加载中...</div>");
			var $chart = $(".project-show-footer-l dd");
			$chart.css("position", "relative");
			var height = $chart.height();
			var width = $chart.width();
			$loading.css({"height": height, "width": width, "left":"10px", "top":"14px", "lineHeight": height + "px"});
			$chart.append($loading);
			
			//根据type跟id下钻到下面区域或者城市
			projectShowServices.getDeal({
				id: id,
				type: type
			}, function(response, status){
				//获取成交分布数据,且设置成交分布图标
				if(type=="area"){
					$scope.setDealTable(response.data.dealCity);
				}else if(type=="city"){
					$scope.setDealTable(response.data.dealProject);
				}
				
				
				//改变当前type,如果当前$scope.showDealType是area，下钻则渠道city，如果是city下钻则渠道project
				if($scope.showDealType == "area"){
					$scope.showDealType = "city";
				}else{
					$scope.showDealType = "project"
				}

				//当showDealType=='city'的时候保存city的列表项目
				if($scope.showDealType == "city"){
					$scope.citiesDate = response.data.dealCity;
				}
				
				$loading.remove();
				
				$(window).trigger("resize");

			}, function(response, status){
				toastr.warning('获取数据失败', '提示', {
					closeButton: true,
					timeOut: 5000
				});
				
				$loading.remove();
			})
		}


		//分布成交下钻后返回
		$scope.dealBack = function(){
			//如果当前是城市列表，则返回区域列表
			if($scope.showDealType == "city"){
				$scope.setDealTable($scope.areasDate);
				$scope.showDealType = "area";
			}else if($scope.showDealType == "project"){
				$scope.setDealTable($scope.citiesDate);
				$scope.showDealType = "city";
			}
		};
		
		
		
		$scope.$watch("customerFeature", function(c){
			if(c == undefined){
				return;
			}
			$(window).trigger("resize");
		});

		$scope.resize = function(){
			//console.log(111);
			$timeout(function(){
				if($(".project-show-footer-r dd").outerHeight() > $(".project-show-footer-l dd").outerHeight()){
					//console.log(1111);
					$(".project-show-footer-l dd").height($(".project-show-footer-r dd").height());
				}else{
					//console.log(22222);
					$(".project-show-footer-r dd").height($(".project-show-footer-l dd").height());
				}
			},200)
		}

		$(window).bind("resize", $scope.resize);


		$scope.$on("$destroy", function(){
            $(window).unbind("resize", $scope.resize);
        });

	}]);
});

