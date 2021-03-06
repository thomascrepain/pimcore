/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Enterprise License (PEL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) 2009-2016 pimcore GmbH (http://www.pimcore.org)
 * @license    http://www.pimcore.org/license     GPLv3 and PEL
 */

pimcore.registerNS("pimcore.document.seemode");
pimcore.document.seemode = Class.create({


    initialize: function(path) {
        this.windowInitialized = false;
        this.start();
    },

    start: function () {

        if (this.windowInitialized == false) {
            this.createWindow();
        }
        this.window.show();

        if (!path) {
            var path = this.determineCurrentPagePath();
        }

        this.setIframeSrc(path);
        window.setTimeout(this.resizeIframe.bind(this), 1000);
    },

    createWindow: function () {

        this.windowInitialized = true;

        this.window = new Ext.Window({
            layout:'fit',
            width:500,
            height:300,
            closeAction:'hide',
            plain: true,
            bodyCls: "pimcore_overflow_scrolling",
            html: '<iframe id="pimcore_seemode" name="pimcore_seemode" src="about:blank" frameborder="0" '
                        + 'allowtransparency="false"></iframe>',
            maximized: true,
            buttons: [
                {
                    text: t("edit_current_page"),
                    iconCls: "pimcore_icon_edit",
                    handler: this.edit.bind(this)
                }
            ]
        });
        this.window.on("resize", this.onWindowResize.bind(this));

        pimcore.viewport.add(this.window);
    },

    onWindowResize: function () {

        this.resizeIframe();
    },

    resizeIframe: function () {

        var width = Ext.getBody().getWidth();
        var height = Ext.getBody().getHeight();

        Ext.get("pimcore_seemode").setStyle({
            width: width + "px",
            height: height + "px",
            backgroundColor: "#fff"
        });
    },

    setIframeSrc: function (path) {
        var d = new Date();
        Ext.get("pimcore_seemode").dom.setAttribute("src", path + "?_time=" + d.getTime());
    },

    determineCurrentPagePath: function () {

        var tabPanel = Ext.getCmp("pimcore_panel_tabs");
        var activeTab = tabPanel.getActiveTab();

        if (activeTab) {
            // test if current tab is a document
            if (activeTab.initialConfig.document) {
                return activeTab.initialConfig.document.data.path + activeTab.initialConfig.document.data.key;
            }
        }
        return "/";
    },

    edit: function () {

        // get current location
        Ext.Ajax.request({
            url: "/admin/document/get-id-for-path",
            params: {
                path: window["pimcore_seemode"].location.pathname
            },
            success: this.getIdForPathComplete.bind(this)
        });
    },

    getIdForPathComplete: function (response) {

        var r = Ext.decode(response.responseText);

        if (r) {
            if (r.id) {
                pimcore.helpers.openDocument(r.id, r.type);
            }
        }

        this.window.hide();
    }

});