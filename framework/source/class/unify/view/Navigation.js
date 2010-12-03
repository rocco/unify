/* ***********************************************************************************************

    Unify Project

    Homepage: unify-project.org
    License: MIT + Apache (V2)
    Copyright: 2009-2010 Deutsche Telekom AG, Germany, http://telekom.com

*********************************************************************************************** */

/* ************************************************************************

#require(unify.event.handler.Android)

************************************************************************ */

/**
 * Manager for navigation of typical iPhone-like applications.
 *
 * * Integrates with browser's history managment
 * * Structures the location using "/" as divider for views and ":" for separating parameters.
 * * Supports multiple ways of controlling the location.
 * * Support for TabView like navigation with deep inner navigation
 */
qx.Class.define("unify.view.Navigation",
{
  extend : qx.core.Object,
  type : "singleton",


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    
    // App ID is used e.g. for storage of navigation
    var app = qx.core.Setting.get("qx.application");
    this.__appId = app.substring(0, app.indexOf("."));
    
    // Initialize storage
    this.__viewManagers = {};
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      VIEW MANAGER MANAGMENT
    ---------------------------------------------------------------------------
    */
    
    /** 
     * {Map} Maps ID of viewManager to the viewManager instance. IDs must be unique
     * in each navigation object.
     */
    __viewManagers : null,
        
    /**
     * Adds a view manager to the global navigation. All views
     * of this view manager will be globally accessible by their name.
     * 
     * @param viewManager {unify.view.ViewManager} View manager instance
     */
    add : function(viewManager)
    {
      var managerId = viewManager.getId();
      
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__viewManagers[managerId]) {
          throw new Error("ViewManager ID is already used: " + managerId);
        }
      }
      
      this.__viewManagers[managerId] = viewManager;
      viewManager.addListener("changePath", this.__onSubPathChange, this);
    },
    
    
    /**
     * Initialized previous state from history or client-side storage.
     *
     * Should be called by the application as soon as all views are registered.
     */
    init : function()
    {
      // Connect to history managment
      var History = unify.bom.History.getInstance();
      History.addListener("change", this.__onHistoryChange, this);

      // Restore path from storage or use default view
      var path;
      if (window.localStorage) {
        path = localStorage[this.__appId + "/navigationpath"];
      }

      // Call history to initialize application
      History.init(path);
      
      // Be sure that every view manager which is part of the navigation is correctly initialized
      var managers = this.__viewManagers;
      for (var id in managers) {
        managers[id].init();
      }
    },
    
    
    /**
     * Returns the view manager which controls the given view
     * 
     * @param viewId {String} ID of view
     * @return {unify.view.ViewManager} Instance of view manager
     */
    getViewManager : function(viewId)
    {
      var managers = this.__viewManagers;
      var manager;
      for (var id in managers) 
      {
        manager = managers[id];
        if (manager.hasView(viewId)) {
          return manager;
        }
      }
      
      return null;
    },




    /*
    ---------------------------------------------------------------------------
      PATH MANAGMENT
    ---------------------------------------------------------------------------
    */
    
    /** {Map[]} List of maps with the keys: view, segment and param */
    __path : null,
    
    /**
     * Delegates the given path to the manager which could handle the first
     * fragment (which then delegates it back for further processing as needed).
     * 
     * @param path {Map[]} List of path fragments (with the keys: view, segment and param)
     */
    delegatePath : function(path)
    {
      var firstFragment = path[0];
      var viewManager = this.getViewManager(firstFragment.view);
      
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!viewManager) {
          throw new Error("The view '" + firstFragment.view + "' is not globally accessible.");
        }
      }

      if (viewManager) {
        viewManager.go(path);
      }
    },
    
    
    /**
     * Syncs the current path with the browser environment (for bookmarking, etc.)
     */
    __syncPath : function()
    {
      var path = this.__path;
      var result = [];
      var part, temp;
      for (var i=0, l=path.length; i<l; i++) 
      {
        part = path[i];
        temp = part.view;
        if (part.segment) {
          temp += "." + part.segment;
        }
        if (part.param) {
          temp += ":" + part.param;
        }
        result.push(temp)
      }
      
      var joined = result.join("/");
      location.hash = "#" + joined;
      
      if (window.localStorage) {
        localStorage[this.__appId + "/navigationpath"] = joined;
      }      
    },
        
    
    /**
     * Reacts on (local) path changes of all registered view managers
     * 
     * @param e {qx.event.type.Event} Event object
     */
    __onSubPathChange : function(e)
    {
      var changed = e.getTarget();
      var reset = false;
      var path = this.__path = [];
      
      var viewManagers = this.__viewManagers;
      for (var id in viewManagers)
      {
        var manager = viewManagers[id];
        if (reset) {
          manager.reset();
        }
        
        path.push.apply(path, manager.getPath());
        
        // Reset all managers after the changed one
        if (manager == changed) {
          reset = true;
        }
      }
      
      this.__syncPath();
    },


    /**
     * Reacts on changes of the browser history.
     *
     * @param e {unify.event.type.History} History event
     */
    __onHistoryChange : function(e)
    {
      // Quick check: Don't allow empty paths
      var currentLocation = decodeURI(e.getLocation());
      if (currentLocation == "")
      {
        this.warn("Ignoring empty path");
        return;
      }

      // Find the first registered manager. This one should be
      // asked for starting with processing of the path object.
      var viewManagers = this.__viewManagers;
      for (var managerId in viewManagers) {
        var manager = viewManagers[managerId];
        break;
      }

      if (qx.core.Variant.isSet("qx.debug", "on")) 
      {
        if (!manager) {
          throw new Error("No managers registered. Could not react on history change!");
        }
      }

      var fragments = currentLocation.split("/");
      var path = [];
      
      for (var i=0, l=fragments.length; i<l; i++) {
        path.push(unify.view.Path.parseFragment(fragments[i]));
      }
      
      manager.go(path);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var History = unify.bom.History.getInstance();
    History.removeListener("change", this.__onHistoryChange, this);
  }
});
