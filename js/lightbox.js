;(function($){

	var LightBox = function(){
		var self = this;
		this.popupMask = $('<div id="G-lightbox-mask">');
		this.popupWin = $('<div id="G-lightbox-popup">');
		this.bodyNode = $(document.body);

		this.renderDOM();

		this.picViewArea = this.popupWin.find('div.lightbox-pic-view');
		this.pouppPic = this.popupWin.find('img.lightbox-image');
		this.picCaptionArea = this.popupWin.find('div.lightbox-pic-caption');
		this.nextBtn = this.popupWin.find('span.lightbox-next-btn');
		this.prevBtn = this.popupWin.find('span.lightbox-prev-btn');

		this.captionText = this.popupWin.find('p.lightbox-pic-desc');
		this.currentIndex = this.popupWin.find('span.lightbox-of-index');
		this.closeBtn = this.popupWin.find('span.lightbox-close-btn');

		this.groupName = '';
		this.groupData = [];
		this.bodyNode.on('click', '.js-lightbox, *[data-role]', function(e){
			// 阻止默认事件&事件冒泡
			e.preventDefault();
			e.stopPropagation();

			var currentGroupName = $(this).attr('data-group');
			if(currentGroupName != self.groupName){
				self.groupName = currentGroupName;
				self.getGroup();
			}

			self.initPopup($(this));
		});

		this.popupMask.on('click', function(){
			$(this).fadeOut();
			self.popupWin.fadeOut();
			self.clear = false;
		});

		this.closeBtn.on('click', function(){
			self.popupMask.fadeOut();
			self.popupWin.fadeOut();
			self.clear = false;
		});

		this.flag = true;
		this.nextBtn.hover(function(){
			if(!$(this).hasClass('disable') && self.groupData.length > 1){
				$(this).addClass('lightbox-next-btn-show');
			}
		}, function(){
			if(!$(this).hasClass('disable') && self.groupData.length > 1){
				$(this).removeClass('lightbox-next-btn-show');
			}
		}).click(function(e){
			if(!$(this).hasClass('disable') && self.flag){
				e.preventDefault();
				e.stopPropagation();
				self.flag = false;
				self.goto('next');
			}
		});

		this.prevBtn.hover(function(){
			if(!$(this).hasClass('disable') && self.groupData.length > 1){
				$(this).addClass('lightbox-prev-btn-show');
			}
		}, function(){
			if(!$(this).hasClass('disable') && self.groupData.length > 1){
				$(this).removeClass('lightbox-prev-btn-show');
			}
		}).click(function(e){
			if(!$(this).hasClass('disable') && self.flag){
				e.preventDefault();
				e.stopPropagation();
				self.flag = false;
				self.goto('prev');
			}
		});

		var timer = null;
		this.clear = false;
		$(window).on('resize', function(){
			if(self.clear){
				window.clearTimeout(timer);
				timer = window.setTimeout(function(){
					self.loadPicSize(self.groupData[self.index].src);
				}, 500);
			}
		}).on('keyup', function(e){
			var keyValue = e.which;
			if(keyValue == 38 || keyValue == 37){
				self.prevBtn.trigger('click');
			}else if(keyValue == 40 || keyValue == 39){
				self.nextBtn.trigger('click');
			}
		});
	};
	LightBox.prototype = {
		goto: function(dir){
			if(dir == 'next'){
				this.index++;
				if(this.index >= this.groupData.length - 1){
					this.nextBtn.addClass('disable').removeClass('lightbox-next-btn-show');
				}
				if(this.index !== 0){
					this.prevBtn.removeClass('disable');
				}
				var src = this.groupData[this.index].src;
				this.loadPicSize(src);
			}else if(dir == 'prev'){
				this.index--;
				if(this.index <= 0){
					this.prevBtn.addClass('disable').removeClass('lightbox-prev-btn-show');
				}
				if(this.index !== this.groupData.length - 1){
					this.nextBtn.removeClass('disable');
				}
				var src = this.groupData[this.index].src;
				this.loadPicSize(src);
			}
		},
		loadPicSize: function(sourceSrc){
			var self = this;
			this.pouppPic.css({'width': 'auto', 'height': 'auto'}).hide();
			this.picCaptionArea.hide();
			this.preLoadImg(sourceSrc, function(){
				self.pouppPic.attr('src', sourceSrc);
				var picWidth = self.pouppPic.width(),
					picHeight = self.pouppPic.height();
				self.changePic(picWidth, picHeight);
			});
		},
		changePic: function(picWidth, picHeight){
			var self = this,
				winWidth = $(window).width(),
				winHeight = $(window).height();

			var scale = Math.min(winWidth/(picWidth + 10), winHeight/(picHeight + 10), 1);
			picWidth = picWidth * scale;
			picHeight = picHeight * scale;

			this.picViewArea.animate({
				width: picWidth - 10,
				height: picHeight - 10
			});
			this.popupWin.animate({
				width: picWidth,
				height: picHeight,
				marginLeft: -(picWidth/2),
				top: (winHeight - picHeight) / 2
			}, function(){
				self.pouppPic.css({
					width: picWidth - 10,
					height: picHeight - 10
				}).fadeIn();
				self.picCaptionArea.fadeIn();
				self.flag = true;
				self.clear = true;
			});

			this.captionText.text(this.groupData[this.index].caption);
			this.currentIndex.text('当前索引：'+(this.index + 1) + 'of ' + this.groupData.length);
		},
		preLoadImg: function(src, callback){
			var img = new Image();
			if(!!window.ActiveXObject){
				img.onreadystatechange = function(){
					if(this.onreadyState == 'complete'){
						callback();
					}
				};
			}else{
				img.onload = function(){
					callback();
				};
			}
			img.src = src;
		},
		showMaskAndPopup: function(sourceSrc, currentId){
			var self = this;
			this.pouppPic.hide();
			this.picCaptionArea.hide();

			this.popupMask.fadeIn();

			var winWidth = $(window).width(),
				winHeight = $(window).height();

			this.picViewArea.css({
				width: winWidth / 2,
				height: winHeight / 2
			});

			this.popupWin.fadeIn();
			var viewHeight = winHeight / 2 + 10;
			this.popupWin.css({
				width: winWidth / 2 + 10,
				height: winHeight / 2 + 10,
				marginLeft: -(winWidth / 2 + 10) / 2,
				top: -viewHeight
			}).animate({
				top: (winHeight - viewHeight) / 2
			}, function(){
				self.loadPicSize(sourceSrc);
			});

			this.index = this.getIndexOf(currentId);

			var groupDataLength = this.groupData.length;
			if(groupDataLength > 1){
				if(this.index === 0){
					this.nextBtn.removeClass('disable');
					this.prevBtn.addClass('disable');
				}else if(this.index === groupDataLength - 1){
					this.nextBtn.addClass('disable');
					this.prevBtn.removeClass('disable');
				}else{
					this.nextBtn.removeClass('disable');
					this.prevBtn.removeClass('disable');
				}
			}
		},
		getIndexOf: function(currentId){
			var index = 0;
			$(this.groupData).each(function(i){
				index = i;
				if(this.id === currentId){
					return false;
				}
			});
			return index;
		},
		initPopup: function(currentObj){
			var self = this,
				sourceSrc = currentObj.attr('data-source'),
				currentId = currentObj.attr('data-id');

			this.showMaskAndPopup(sourceSrc, currentId);
		},
		getGroup: function(){
			var self = this;
			var groupList = this.bodyNode.find('*[data-group='+this.groupName+']');
			self.groupData.length = [];
			groupList.each(function(){
				self.groupData.push({
					src: $(this).attr('data-source'),
					id: $(this).attr('data-id'),
					caption: $(this).attr('data-caption')
				});
			});
		},
		renderDOM: function(){
			var strDom = '<div class="lightbox-pic-view">'+
							'<span class="lightbox-btn lightbox-prev-btn"></span>'+
							'<img class="lightbox-image" src="images/1-1.jpg" alt="">'+
							'<span class="lightbox-btn lightbox-next-btn"></span>'+
						'</div>'+
						'<div class="lightbox-pic-caption">'+
							'<div class="lightbox-caption-area">'+
								'<p class="lightbox-pic-desc">title</p>'+
								'<span class="lightbox-of-index">当前索引：0of4</span>'+
							'</div>'+
							'<span class="lightbox-close-btn"></span>'+
						'</div>';
			this.popupWin.html(strDom);
			this.bodyNode.append(this.popupMask, this.popupWin);
		}
	};
	window.LightBox = LightBox;

})(jQuery);