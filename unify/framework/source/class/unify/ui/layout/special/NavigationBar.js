/*
===============================================================================================

		Unify Project

		Homepage: unify-project.org
		License: MIT + Apache (V2)
		Copyright: 2010-2011, Sebastian Fastner, Mainz, Germany, http://unify-training.com

===============================================================================================
*/

/**
 * EXPERIMENTAL
 *
 * Layout for navigation bar
 */
(function() {
	var SPACER = 6;
	
	core.Class("unify.ui.layout.special.NavigationBar", {
		include : [unify.ui.layout.Base],
		
		construct : function() {
			unify.ui.layout.Base.call(this);
		},
		
		members : {
			__left : null,
			__right : null,
			__title : null,
		
			/**
			 * Render part of layout stack that is managed by this layout manager. The part
			 * has size @availWidth {Integer} and @availHeight {Integer}.
			 */
			renderLayout : function(availWidth, availHeight) {
				if (this._invalidChildrenCache) {
					this.__rebuildCache();
				}
				
				var left = this.__left;
				var right = this.__right;
				var title = this.__title;
				
				var i,ii,e,hint,leftx=SPACER,rightx=availWidth-SPACER,top,leftWidth=0,rightWidth=SPACER;
				
				for (i=0,ii=left.length;i<ii;i++) {
					e = left[i];
					hint = e.getSizeHint();
	
					top = Math.floor(availHeight / 2 - hint.height / 2);
					e.renderLayout(leftx, top, hint.width, hint.height);
					leftx += hint.width + SPACER;
				}
				leftWidth = leftx;
				
				for (i=right.length-1;i>=0;i--) {
					e = right[i];
					hint = e.getSizeHint();
					
					var elemWidth = hint.width + SPACER;
					rightWidth += elemWidth;
					rightx -= elemWidth;
					top = Math.floor(availHeight / 2 - hint.height / 2);
					e.renderLayout(rightx, top, hint.width, hint.height);
				}
				rightx -= SPACER;
				
				var availTitleWidth = rightx - leftx;
				var leftBiggerThanRight = leftWidth > rightWidth;
				var optimalTitleWidth = availWidth - (leftBiggerThanRight ? (leftWidth*2) : (rightWidth*2));
				hint = title.getSizeHint();
				
				var titleWidth = hint.width;
				if (hint.maxWidth && titleWidth > hint.maxWidth) {
					titleWidth = hint.maxWidth;
				}
				if (hint.minWidth && titleWidth < hint.minWidth) {
					titleWidth = hint.minWidth;
				}
				
				// Center title vertical position in avail room
				var titleHeight = hint.height;
				if (titleHeight > availHeight) {
					titleHeight = availHeight;
				}
				var titleTop = Math.floor(availHeight / 2 - titleHeight / 2);
				var titleLeft;
	
				if (titleWidth <= optimalTitleWidth) {
					// Space for optimal centered title available -> center title
					titleLeft = Math.floor(availWidth / 2 - titleWidth / 2);
				} else if (titleWidth <= availTitleWidth) {
					// Center title in available room
					titleLeft = leftWidth + Math.round((availTitleWidth - titleWidth) / 2.0);
				} else {
					// Title is bigger than avail space
					titleLeft = leftWidth;
					titleWidth = availTitleWidth;
				}
				
				title.renderLayout(titleLeft, titleTop, titleWidth, titleHeight);
			},
			
			_computeSizeHint : function() {
				if (this._invalidChildrenCache) {
					this.__rebuildCache();
				}
				
				var left = this.__left;
				var right = this.__right;
				var title = this.__title;
				
				var minWidth = 0;
				var width = 0;
				var minHeight = 0;
				var height = 0;
				
				var i, ii;
				var hint;
				
				for (i=0,ii=left.length; i<ii; i++) {
					hint = left[i].getSizeHint();
					
					minWidth += hint.minWidth;
					width += hint.width;
					minHeight = Math.max(minHeight, hint.minHeight);
					height = Math.max(height, hint.height);
				}
				for (i=0,ii=right.length; i<ii; i++) {
					hint = right[i].getSizeHint();
					
					minWidth += hint.minWidth;
					width += hint.width;
					minHeight = Math.max(minHeight, hint.minHeight);
					height = Math.max(height, hint.height);
				}
				
				hint = title.getSizeHint();
					
				minWidth += hint.minWidth;
				width += hint.width;
				minHeight = Math.max(minHeight, hint.minHeight);
				height = Math.max(height, hint.height);
				
				var spacer = (left.length + right.length) * SPACER;
				minWidth += spacer;
				width += spacer;
				
				return {
					width: width,
					minWidth: minWidth,
					height: height,
					minHeight: minHeight
				};
			},
			
			/**
			 * Rebuilds cache of layout children
			 */
			__rebuildCache : function() {
				var all = this._getLayoutChildren();
				var left = [];
				var right = [];
				var title = null;
				
				for (var i=0,ii=all.length; i<ii; i++) {
					var child = all[i];
					
					var position = child.getLayoutProperties().position;
					if (position == "title" || position == "center") {
						if (title) {
							throw new Error("It is not allowed to have more than one child aligned to 'title'!");
						}
						title = child;
					} else if (position == "left") {
						left.push(child);
					} else if (!position || position == "right") {
						right.push(child);
					} else {
						throw new Error("Position '"+position+"' is not supported!");
					}
				}
				
				this.__left = left;
				this.__right = right;
				this.__title = title;
			}
		}
	});
})();
