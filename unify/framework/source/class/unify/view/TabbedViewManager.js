/*
===============================================================================================

		Unify Project

		Homepage: unify-project.org
		License: MIT + Apache (V2)
		Copyright: 2011, Telekom AG
		Author: Dominik Göpel

===============================================================================================
*/

/**
 * EXPERIMENTAL
 */
core.Class("unify.view.TabbedViewManager", {
	include : [unify.view.ViewManager, unify.ui.core.MChildControl],
	implement : [unify.view.IViewManager],

	/**
	 * Constructor. @managerId {String} is the application global unique ID of this manager.
	 * Optional a @layout {unify.ui.layout.Base?null} can be given.
	 */
	construct : function(managerId,layout) {
		unify.view.ViewManager.call(this, managerId, layout);
		unify.ui.core.MChildControl.call(this);
		
		this.__tabs={};
		this.__currentTab=null;
		this.addListener("changePath", this._onViewManagerChangePath, this);
	},

	properties :
	{
		/** {Stirng} Appearance ID */
		appearance : {
			init: "tabbedviewmanager"
		}
	},
	
	/*
	----------------------------------------------------------------------------
		 MEMBERS
	----------------------------------------------------------------------------
	*/

	members :
	{
		/** map of all tab widgets by viewInstance*/
		__tabs : null,
		/** reference to the tab widget of the currently selected tab */
		__currentTab: null,

		/**
		 * implementation for MChildControl
		 * 
		 * override this function if you need a different implementation for a child
		 * 
		 * @param id {String} unique id for the child
		 */
		_createChildControlImpl: function(id){
			var control;
			if(id=="tabbar"){
				control=new unify.ui.container.Bar();
				this.add(control,{bottom:0,left:0,right:0});
			}
			return control || this.base(arguments,id);
		},

		 /**
		 * Registers a new view @viewClass {Function}. All views must be registered before being used.
		 * If @isDefault {Boolean?false} is set to true it is the first visible view if no path is
		 * given in URL. Optional @excludeFromTabs {Boolean?false} exclude tab from tabbed navigation. This is useful for views that are not first level.
		 */
		register : function(viewClass, isDefault, excludeFromTabs){
			this.base(arguments,viewClass,isDefault);
			var viewInstance = viewClass.getInstance();
			if(!excludeFromTabs){
				this.__tabs[viewInstance]=this._addAsTab(viewInstance);
			}
		},

		/**
		 * adds a tab for viewInstance to the tabbar childcontrol
		 * 
		 * override this function if you change the tabbar implementation by overriding _createChildControlImpl
		 * 
		 * @param viewInstance {Object} instance of a unify.ui.view.StaticView (or subclass) singleton
		 * @return {unify.ui.core.Widget} the created tab widget
		 */
		_addAsTab: function(viewInstance){
			var config={
				label : viewInstance.getTitle("tab-bar"),
				jump : viewInstance.getId(),
				rel : "same"
			};
			var item=this.getChildControl("tabbar").addItem(config);
			return item;
		},

		/**
		 * Reacts on path changes of the view manager and updates "selected" property accordingly.
		 *
		 * @param e {qx.event.type.Data} Data event
		 */
		_onViewManagerChangePath : function(e)
		{
			var view = this.getCurrentView();
			if(view){
				var tab=this.__tabs[view];
				var oldTab=this.__currentTab;
				if(tab){
					if(oldTab){
						oldTab.removeState("currentTab");
					}
					tab.addState("currentTab");
					this.__currentTab=tab;
				}
			}
		}
	},
	
	/**
	 * destructor
	 */
	destruct : function(){
		this.removeListener("changePath",this._onViewManagerChangePath,this);
		this.__currentTab=this.__tabs=null;
	}
});