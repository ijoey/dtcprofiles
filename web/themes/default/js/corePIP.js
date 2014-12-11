// ajb2636 - 7-8-2014
thdOnlineCommon.appAlias = "S6";
var applianceFlag = (typeof window.isAppliance === 'undefined') ? false : window.isAppliance;

// Return wc user id based on cookie WC_USERACTIVITY_{userid}   
function getUserIdFromUserActivityCookie() {
    var startsWithName = "WC_USERACTIVITY_";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = (ca[i]);
        if (c.indexOf(startsWithName) != -1) {
            return c.substring(c.lastIndexOf('_') + 1, c.indexOf('='));
        }
    }
    return "";
}
var status = "";
var userId = "";
var isUpdateZip = false;

// Returns information on whether a user has visited the site or has logged in
function readUserStatusCookie() {
    var wcPersistent = readBrowserCookie('WC_PERSISTENT');
    var wcUserActivity = getUserIdFromUserActivityCookie();
    //Authenticated user
    if (readCookie("THD_USERSTATUS") == "1") {
        status = "authenticated";
        userId = wcUserActivity;
    }
    //Recognized user
    else if (readCookie("THD_REMEMBERME") && readCookie("THD_USERSTATUS") != "1") {
        status = "recognized";
        userId = wcUserActivity;
    } else if (wcUserActivity == -1002) {
        //Default status is anonymous
        status = "anonymous";
        userId = "-1002";
    } else {
        // Guest
        status = "guest";
        userId = wcUserActivity;
    }

}




function PipView() {
        // Properties
        var t = this;
        t.image = '';
        t.thumb = '';
        // Self-Initialization
        if ((document.getElementById) && (document.getElementsByTagName)) {
            // Thumbnail Controls
            t.controlsParent = document.getElementById('pip-thumbs');
            if (t.controlsParent) {
                t.controls = t.controlsParent.getElementsByTagName('a');
                for (var i = 0, control; i < t.controls.length; i++) {
                    control = t.controls[i];
                    if (control.className == 'thumb-control') {
                        control.onclick = function() {
                            t.toggleImage(this);
                            return false;
                        };
                    }
                }
            } else {
                return false;
            }
            // Main Image
            t.image = document.getElementById('pip-main-image');
            if (!t.image) {
                return false;
            }
        } else {
            return false;
        }
        // Methods
        t.toggleImage = function(link) {
            t.image.src = link.href;
        };
    }
    /*** Media Controls ***/
    // Controls the popup (position, size) and various options for the Vendaria player. 
onloadHandlers[onloadHandlers.length] = 'PipViewer = new PipView()';

function openFeatureFlex(URL, title, winWidth, winHeight, resizable, scrollbars, location, toolbar, status, menubar) {
    //Added to remove green color that flashes up prior to the white loading screen in vendaria link.
    var url = URL.split("D6D7A5");
    url[0] += "FFFFFF";
    var URL = url[0] + url[1];
    var winY, winX = 0;
    if (screen.width > winWidth && screen.height > winHeight) {
        winX = (screen.width - winWidth) / 2;
        winY = (screen.height - winHeight) / 2;
    }
    var winOptions = "";
    if (resizable) {
        winOptions += ",resizable";
    }
    if (scrollbars) {
        winOptions += ",scrollbars";
    }
    if (location) {
        winOptions += ",location";
    }
    if (toolbar) {
        winOptions += ",toolbar";
    }
    if (status) {
        winOptions += ",status";
    }
    if (menubar) {
        winOptions += ",menubar";
    }
    if (winOptions.charAt(0) == ",") {
        winOptions = winOptions.substr(1);
    }
    winOptions += ',top=' + winY + ',left=' + winX + ',screenX=10,screenY=10,width=' + winWidth + ',height=' + winHeight;
    var popupWin2 = window.open(URL, title, winOptions);
    window.top.name = 'opener';
    if (popupWin2) {
        popupWin2.focus();
    }
}

function updateUserTokenInBV() {
    if (typeof userToken != undefined && userToken !== "" && userToken !== null && userToken !== "030c7bb021407bc7279d1b1e491def992d31303032") {
        $.each($(".BVRRRootElement a[data-bvjsref][name]"), function(index, obj) {
            var BVRefLink = $(obj);
            var BVRefLinkHref = BVRefLink.data("bvjsref");
            if (BVRefLinkHref.toLowerCase().indexOf("writereview") > -1) {
                BVRefLinkHref = BVRefLinkHref.replace(getQueryStringParams(BVRefLinkHref, 'user'), userToken);
                BVRefLink.attr("data-bvjsref", BVRefLinkHref);
            }
        });
    }
}


function EnterKeyPress(e) {
    var key;
    if (window.event) {
        key = window.event.keyCode; //IE
    } else {
        key = e.which; //firefox     
    }
    if (key == 13) {
        localize2NewStore(document.getElementById('bopisZip').value);
    }
    return (key != 13);
}



function invokeBopisOverlay(quantity) {
    var canInvokeBopisOverlay = true,
        myNewUrl = '',
        $link;
    if (quantity == '' || quantity == null) {
        alert("quantity field cannot be blank");
        canInvokeBopisOverlay = false;
        return;
    }
    if (!isCheckNumeric(quantity)) {
        canInvokeBopisOverlay = false;
        return;
    }
    if (!isPositiveInt(quantity)) {
        canInvokeBopisOverlay = false;
        return;
    }
    if (canInvokeBopisOverlay) {
        $link = $('#id_PIP_invokeBopisOverlay_link');
        myNewUrl = $link.attr('href');
        if (myNewUrl.indexOf('quantity=') > -1) {
            // Modified - WCS7UP CodeMerge - 4.5.2
            myNewUrl = myNewUrl.replace(/quantity=\d*/, 'quantity=' + quantity);
        } else {
            myNewUrl = myNewUrl + '&quantity=' + quantity;
        }
        $link.attr('href', myNewUrl);
    } else {
        eval("document.getElementById('buybox_quantity_field').focus()");
    }
}

function isCheckNumeric(strString) {
    var strValidChars = "01234567890";
    var msg = 'The quantity field must be a positive number!';
    var strChar;
    var blnResult = true;
    for (i = 0; i < strString.length && blnResult == true; i++) {
        strChar = strString.charAt(i);
        if (strValidChars.indexOf(strChar) == -1) {
            blnResult = false;
            alert(msg);
        }
    }
    return blnResult;
}

function isPositiveInt(c) {
    // check to make sure the current value is greater then zero
    var msg = 'The quantity field must contain a number greater than zero!';
    if (parseInt(c) < 1) {
        alert(msg);
        return false;
    } else {
        return true;
    }
}

function checkQty(quantity, errorqtyDiv, limitQtyDiv) {
    if (qtyLimit != null && qtyLimit < quantity.value) {
        document.getElementById(limitQtyDiv).style.display = "block";
        document.getElementById(errorqtyDiv).style.display = "none";
        // Modified - WCS7UP CodeMerge - 4.5.2
        document.getElementById(limitQtyDiv).innerHTML = '<span class="error"> We\'re sorry, this promotional item is limited to ' + qtyLimit + ' per order.</span>';
        quantity.value = qtyLimit;
        return false;
    } else {
        document.getElementById(limitQtyDiv).style.display = "none";
        return isNumeric(quantity, errorqtyDiv);
    }
}

function validateQty(quantity, errorqtyDiv) {
        document.getElementById("qtyLimitDiv").style.display = "none";
        return isNumeric(quantity, errorqtyDiv);
    }
    // WCS7UP - Ensighten - Refactoring Start
    //If logic added for Defect 16084
if (true) {
    var outOfStock = '';
    if (outOfStock)
        _hddata["outOfStock"] = outOfStock;
    // WCS7UP - Ensighten - Refactoring End
}




var $thdPIP = {};
var $root = {};

//##################################################################################
//METHODS
//##################################################################################


//Notes:
//If the QuickView, Required Parts or Required Items Overlay ever need to know
//What the current CatEntryID of the parent PIP page is, they can get that from this property: $thdPIP.cur_CatEntryID



$thdPIP.quickViewResults = function(CatEntryId) {
    var HostName = window.location.hostname;
    var ProductURL = 'http://' + www.homdepot.com + '/webapp/wcs/stores/servlet/ProductDisplay?storeId=10051&productId=' + CatEntryId + '&langId=-1&catalogId=10053&MERCH=REC-_-homepage-1-_-NA-_-100677926-_-N';
    var relatedItemCatEntryID = $thdPIP.cur_CatEntryID_relatedItem;
    $root.find('div.item[_catentryid="' + relatedItemCatEntryID + '"]').find('a.product').attr('href', ProductURL);
};


//########## AJAX loading & processing -------------------------------------------------------------------------------------

$thdPIP.getJSON_applianceCheckAvailability = function(zipcode) {

    if (zipCodeValidator(zipcode)) {

        var attributes = $thdPIP.selectedAttributes;
        $('[name=zipCodeHidden]').attr('value', zipcode);
        $('[name=zipCode]').attr('value', zipcode); //defect #16154 - zip code not being passed in the url


        var requiredPartsModelValue = $('#requiredParts_modal').attr('href');
        requiredPartsModelValue = requiredPartsModelValue + '&zipCode=' + zipcode;
        $('#requiredParts_modal').attr('href', requiredPartsModelValue);


        var nickNameVal = "APPLIANCE DELIVERY - " + zipcode;
        $('[name=nickName]').attr('value', nickNameVal);
        var attributes = $thdPIP.selectedAttributes;
        var url = $('#wcsNonSecureUrlPrefix').val() + 'AOLProductAvailabilityLookup?storeId=' + $('[name=storeId]').val() + '&productId=' + $('[name=productId]').val() + '&zipCode=' + zipcode + '&modelNumber=' + $('[name=modelNumber]').val() + '&vendorNumber=' + $('[name=vendorNumber]').val() + '&URL=AOLProductAvailabilityLookupJSONView' + '&NEWPIP=100';

        var noCache = new Date();
        noCache = noCache.getTime();
        sendData = {
            'attributes': attributes,
            'zipcode': zipcode,
            'noCache': noCache
        };
        $('.checkingimage').css('display', 'block');
        $('#zipCodeTxt').css('display', 'none');
        $('#zipCodeImg').css('display', 'none');
        $root.find('.buybox_zipErr').hide();
        $root.find('.zipCode').removeClass('error');
        $('#hd-bica #buybox_ctn #availabilityStates .head').css('display', 'none');


        $.getJSON(url, sendData, function(data) {
            $thdPIP.hide_editZipcodeOverlay();
            $('.checkingimage').css('display', 'none');
            $('#zipCodeTxt').css('display', 'block');
            $('#zipCodeImg').css('display', 'block');
            //        $('#pip-appliance-delivery-cdetails').css('display','none');

            //available
            if (data.Catentry[0].ResponseCode == 'available') {
                $thdPIP.appliance_showAvailabilityState(1);
                $root.find('.deliveryDate').text(data.Catentry[0].deliveryDate);
                $root.find('.addToCart_btn').removeClass("disable");
                $root.find('a.addToCart_btn').addClass("triggerATCAppliOverlay");
                //          $('#pip-appliance-delivery-cdetails').css('display','block');
                //$thdPIP.show_requiredParts();
                createEnsightenData(data, 1, false);
            }
            if (data.Catentry[0].ResponseCode == 'backordered') {
                $thdPIP.appliance_showAvailabilityState(2);
                $('input[name=applianceETA_1]').val(data.Catentry[0].deliveryDate);
                $root.find('.deliveryDate').text(data.Catentry[0].deliveryDate);
                $root.find('.addToCart_btn').removeClass("disable");
                $root.find('a.addToCart_btn').addClass("triggerATCAppliOverlay");
                //          $('#pip-appliance-delivery-cdetails').css('display','block');
                //$thdPIP.show_requiredParts();
                createEnsightenData(data, 2, true);
            }
            if (data.Catentry[0].ResponseCode == 'oos_eta_unavail' || data.Catentry[0].ResponseCode == 'oos_altmodel') {
                $thdPIP.appliance_showAvailabilityState(3);
                $root.find('.addToCart_btn').addClass("disable");
                $root.find('.addToCart_btn').removeClass("triggerATCAppliOverlay");
                //          $('#pip-appliance-delivery-cdetails').css('display','none');
                $thdPIP.hide_requiredParts();
                createEnsightenData(data, 3, true);
            }
            if (data.Catentry[0].ResponseCode == 'unavailable' || data.Catentry[0].ResponseCode == 'unavail_zipcode' || data.Catentry[0].ResponseCode == 'unavail_primarystore') {
                $thdPIP.appliance_showAvailabilityState(4);
                $thdPIP.hide_requiredParts();
                $root.find('.addToCart_btn').addClass("disable");
                $root.find('.addToCart_btn').removeClass("triggerATCAppliOverlay");
                //          $('#pip-appliance-delivery-cdetails').css('display','none');
                createEnsightenData(data, 4, true);
            }
            if (data.Catentry[0].ResponseCode == 'nomatch_cartzipcode') {
                $thdPIP.appliance_showAvailabilityState(5);
                //$root.find('.deliveryDate').text(data.Catentry[0].isAvailableMSG[0]);
                $thdPIP.hide_requiredParts();
                $root.find('.addToCart_btn').addClass("disable");
                $root.find('.addToCart_btn').removeClass("triggerATCAppliOverlay");
                //          $('#pip-appliance-delivery-cdetails').css('display','none');
                createEnsightenData(data, 5, true);
            }

            //Kill Switch enabled
            if ((data.Catentry[0].ResponseCode == 'available_service_exception' || data.Catentry[0].ResponseCode == 'available') && (data.Catentry[0].errorCode == "7001" || data.Catentry[0].errorCode == "7002" || !data.Catentry[0].deliveryDate)) {
                $thdPIP.appliance_showAvailabilityState(7);
                createEnsightenData(data, 7, false);
                //            $('#pip-appliance-delivery-cdetails').css('display','block');
                $('#addAvailabilityStates').css('display', 'none');
            }

            // Reenabling ATC button for available_service_exception (8000) when zip code lookup is down
            // Added for Defect: 40567
            if (data.Catentry[0].errorCode == 8000) {
            	$root.find('.addToCart_btn').removeClass("disable");
            }
            
            if ($('.triggerATCAppliOverlay').length) {
                var responseCode = data.Catentry[0].ResponseCode;
                var deliveryDate = data.Catentry[0].deliveryDate;
                var zipCode = data.Catentry[0].zipcode;

                if (responseCode !== null && typeof(responseCode) !== "undefined") {
                    $('.triggerATCAppliOverlay').attr("data-prodstatus", responseCode);
                }
                if (deliveryDate !== null && typeof(deliveryDate) !== "undefined") {
                    $('.triggerATCAppliOverlay').attr("data-delvdate", deliveryDate);
                }
                if (zipCode !== null && typeof(zipCode) !== "undefined") {
                    $('.triggerATCAppliOverlay').attr("data-zip", zipCode);
                }

            }

            //not available
            // if(data.Catentry[0].isAvailable=='false'){
            //$thdPIP.appliance_showAvailabilityState(x);
            //}
        });

        //update zip on PIP
        $root.find('.state #availabilityZip').text(zipcode);
    } else {
        $root.find('.buybox_zipErr').show();
        $root.find('.zipCode').addClass('error');
    }


    // create ensighten data for appliance zip code avaiblity    
    function createEnsightenData(jsonData, stateNum, isError) {
        var info = $(".state")[stateNum];
        var msg = null;
        if (isUpdateZip) {
            _hddata["overlayType"] = "appliance change zip";
            _hddata["pageName"] = "appliance>change zip availability";
            _hddata["pageType"] = "appliance";
            //_hddata["productID"]="202998357"
        }

        if (isError) {
            msg = $(info).find(".error-msg").text().trim();
            _hddata["availability"] = "unavailable";
            _hddata["errorMessage"] = "appliance: " + msg;
        } else {
            msg = $(info).find(".critical-msg").text().trim();
            _hddata["availability"] = "available";
        }


        _hddata["appDeliveryZip"] = $root.find('#availabilityStates input.zipCode').val();
        _hddata["fulfillmentMethod1"] = "shipped";
        if (jsonData.Catentry[0].ResponseCode != null) {
            _hddata["appStatus"] = jsonData.Catentry[0].ResponseCode;
        }
        if (window.hddataReady) {
            window.hddataReady("check availability");
        }
    }



    //availCheckDone =true;
    partsServicesCheckDone = true;
    return true;
};


$thdPIP.loadAssetLibrary = function(filename) {
    $.get('/wcsstore/hdus/scripts/library/' + filename, function(data) {

        //create assetsLibrary
        $root.append('<div id="assetLibrary"></div>');
        $assets = $root.find('#assetLibrary');
        $assets.html(data);
        $assets.css('display', 'none');
        $thdPIP.$assets = $assets; //save

        $thdPIP.doAfter();

    });
}

$thdPIP.setAvailability = function(mouseMode) {
    var count_search = 0;
    var matches = {};
    var data = $thdPIP.JSON.attributes;
    var currentSelectionMatch = false;
    var currentSelectionMatch_data = {};
    var currentSelectionAvailable = false;

    //reset all attributes
    //read cookie to see if user has already checked appliance availability
    function checkCookie() {
        var cookie = $.cookie('superSku_checkAvailability');
        if (cookie == null) {
            cookie = $.cookie('CartItems');
        }
        if (cookie != null) {
            var cookie_arr = cookie.split('&');
            for (var i in cookie_arr) {
                //alert(cookie_arr[i]);
                var arr = cookie_arr[i].split('=');
                if (arr.length > 1) {
                    arr = arr[1].split(',');
                    var condition = arr[0];
                    var zipcode = arr[1];
                    //alert(zipcode+' '+condition);
                }
            }
            if (zipcode) {
                $thdPIP.getJSON_applianceCheckAvailability(zipcode);
            }
        }
    }
    checkCookie();

};


$thdPIP.appliance_showAvailabilityState = function(index) {
    //hide all
    $root.find('#availabilityStates .state').hide();
    $root.find('#addAvailabilityStates .state').hide();
    //show selected
    $root.find('#availabilityStates .state').eq(index).show();
    $root.find('#addAvailabilityStates .state').eq(index).show();
};

$thdPIP.show_editZipcodeOverlay = function() {
    $root.find('#overlay_editZipcode').show(0);
    if (typeof $thisIsIE6 != 'undefined') {
        $root.find('select').css('visibility', 'hidden');
    }
};

$thdPIP.hide_editZipcodeOverlay = function() {
    $root.find('#overlay_editZipcode').hide(0);
    if (typeof $thisIsIE6 != 'undefined') {
        $root.find('select').css('visibility', 'visible');
    }
};

$thdPIP.show_requiredParts = function() {
    $thdPIP.hide_requiredParts();
    $root.find('.grp_requiredParts').show(0);
};

$thdPIP.hide_requiredParts = function() {
    $root.find('.grp_requiredParts').hide(0);
};

$thdPIP.show_requiredPartsOverlay = function() {
    $('#fancybox-close').hide();
    $('#fancybox-overlay').hide();
};

$thdPIP.doAfter = function() {
    $thdPIP.doAfterCount++;
    if ($thdPIP.doAfterCount == 1) {

        //show availabilityState
        if ($('#availabilityStates')) {
            $thdPIP.appliance_showAvailabilityState(0);
        }

        function setupEvents() {
            //required items/parts overlay

            $root.find('.grp_requiredParts .view_btn').bind('click', function() {
                $thdPIP.show_requiredPartsOverlay();
            });

            //edit zipcode overlay
            $root.find('.grp_addToCart .edit_btn').bind('click', function() {
                if ($('.triggerATCAppliOverlay').length) {
                    clearCartDataFields();
                }
                $thdPIP.show_editZipcodeOverlay();

            });
            $root.find('#overlay_editZipcode').find('.close').bind('click', function() {
                $thdPIP.hide_editZipcodeOverlay();
                $("#zipCodeErrorMessage").hide();
                $("#f_editZipCode").removeClass("error");
            });
            $root.find('#overlay_editZipcode .btn_do_updateZip').bind('click', function() {
                var zipcode = $root.find('#overlay_editZipcode #f_editZipCode').val();

                if (zipcode != '' && zipCodeValidator(zipcode)) {
                    $thdPIP.appliance_showAvailabilityState(0);
                    $('[name=zipCode]').attr('value', zipcode);
                    $thdPIP.hide_requiredParts();
                    $root.find('.addToCart_btn, a.triggerATCAppliOverlay').show();
                    $thdPIP.hide_editZipcodeOverlay();
                    $("#zipCodeErrorMessage").hide();
                    $("#f_editZipCode").removeClass("error");

                    // Passing available_service_exception (8000) through for when zip code lookup is down
                    // Added for Defect: 40567
                    if (!isWebServiceExceptionOccurred() || getAOLCookieErrorCode() == 8000) {
                        var zipcode = $root.find('#overlay_editZipcode #f_editZipCode').val();
                        isUpdateZip = true;
                        $thdPIP.getJSON_applianceCheckAvailability(zipcode);
                    }

                } else {
                    $("#zipCodeErrorMessage").show();
                    $("#f_editZipCode").addClass("error");

                }
            });

            //prevent defaults
            $root.find('#availabilityStates input.checkAvailability').bind('click mousedown', function() {
                return false;
            });
            $root.find('#overlay_editZipcode .btn_do_updateZip').bind('click mousedown', function() {
                return false;
            });

            //show availability
            $root.find('#availabilityStates input.checkAvailability').bind('click', function() {
                var zipcode = $root.find('#availabilityStates input.zipCode').val();

                $thdPIP.getJSON_applianceCheckAvailability(zipcode);
            });
        }
        setupEvents();

    }
};


// Function used to reposition Vendaria icons to all be center aligned 
// Currently because of how vendaria is being returned 0 auto will not work
// Will also adjust for SSKUs
function hiddenVenIconChk() {
    var numOfHiddenVenIcons = $('.product_imgctrl .clear_btn').filter(function() {
        return $(this).css('display') == 'none';
    }).length;

    if (numOfHiddenVenIcons == "0") {
        $('.features_icon').addClass("zoneAlast");
    }
    if (numOfHiddenVenIcons == "2") {
        $('.product_imgctrl').css("padding-left", "50px");
    }
    if (numOfHiddenVenIcons == "3") {
        $('.product_imgctrl').css("padding-left", "90px");
    }
    if (numOfHiddenVenIcons == "4") {
        $('.product_imgctrl').css("padding-left", "130px");
    }
}

//Function validates quantity against numberic value, empty value and quantity limits
//Value type checked against function isValidQuantity, also checks against 0 value
//Display appropriate error handling for quantity limits and value type 
function checkQty() {
    var qtyField = $('#buybox_quantity_field');
    var getQtyVal = '';
    var defaultQty = (typeof qtyLimit !== 'undefined') ? qtyLimit : 1;

    if (qtyField.length) {
        getQtyVal = qtyField.val();
    }

    //Is quantity valid  
    if (isValidQuantity(getQtyVal)) {
        qtyLimit = parseInt(qtyLimit);
        getQtyVal = parseInt(getQtyVal);
        $('#errorqty').hide();
        //Is quantity available
        if (qtyLimit != null && getQtyVal > qtyLimit) {

            $('#errorqty').hide();
            $('#qtyLimitDiv').show();
            $('#qtyLimitDiv').html('<span class="error">We\'re sorry, this promotional item is limited to ' + qtyLimit + ' per order.</span>');
            $('#buybox_quantity_field').val(qtyLimit);
            return false;
        } else {
            $('#qtyLimitDiv').hide();
            return true;
        }
        return true;
    } else {
        $('#errorqty').show();
        $('#buybox_quantity_field').val(defaultQty);
        return false;
    }

}

//Validate that a value is numberic, is great than 0, not null
function isValidQuantity(qty) {
    var numericExpression = /^[0-9]+$/;
    if (qty.match(numericExpression) != null && Number(qty) > 0) {
        return true;
    }
    return false;
}


function updateStoreInfoHdr() {
    if (typeof getHeaderLocalStore !== 'undefined') {
        $('#myStore').html(getHeaderLocalStore('menu'));
    }
}

//If a user is not localized an ajax call is made to get store information cookies. 
//Upon success, rerun cookie initializer, header functions and boss messaging

function getLocalizedVal() {
    // $.ajax("/p/triggerAutoLocalization").done(function() {cookieManager.initializeMasterCookie(), updateStoreInfoHdr(); });
    updateStoreInfoHdr();
}



function getURLParameters() {
    return getParameters(window.location.search);
}

function getParameters(paramString) {

    var params = {},
        pairs = [],
        pair = [];
    if (paramString.length > 0) {
        paramString = paramString.slice(1, paramString.length);

        pairs = paramString.split('&');

        for (var i = pairs.length - 1; i >= 0; i--) {
            pair = pairs[i].split('=');
            params[pair[0]] = (pair[1] || '');
        }
    }
    return params;

}

function getURLQueryStringParams(sParam) {
    return getQueryStringParams(window.location.search, sParam);
}

function getQueryStringParams(urlString, sParam) {

        var sPageURL = urlString.substring(1);
        var sURLVariables = sPageURL.split('&');

        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }
    //Center ILP overlay on page
jQuery.fn.centerOverlay = function() {
    this.css({
        "position": "absolute",
        "top": (($(window).height() - ($(window).height() * .9)) + ($(window).scrollTop()) - 250 + "px"),
        "left": "4%"
    });
    return this;
};

//Function to add stripes to table
function stripedTables() {

    $('table.tablePod tr:even').addClass('even');

};

function trimInlineTitle(wrapper, charCount) {
    var getTitleStr = $(wrapper).text();
    if (getTitleStr != undefined && getTitleStr.length > charCount) {
        var trimInlineTitle = getTitleStr.substring(0, charCount - 3),
            str = trimInlineTitle.substring(0, Math.min(trimInlineTitle.length, trimInlineTitle.lastIndexOf(" ")));
        $(wrapper).text(str + "...");
    }
};

function showSectionHeader(e) {

    $(e).on('click', 'a', function() {
    	if($(this).attr("href")!="#thdHeader"){
	        var adjustForStickyNavHeight = $('#menuScroll').outerHeight(true),
	            stickyNavAlreadyDisplayed = $('#menuScroll').css('display') === 'block',
	            hash = this.hash;
	
	        $('html,body').animate({
	            scrollTop: $(hash).offset().top - ((stickyNavAlreadyDisplayed) ? adjustForStickyNavHeight : 0)
	        }, 300, function() {
	            $('html,body').scrollTop($(hash).offset().top - adjustForStickyNavHeight);
	        });
    	}
    });
}

//##################################################################################
//BOPIS DISPLAY
//##################################################################################
$(function() {
    var bopisLink = $("#id_PIP_invokeBopisOverlay_link");
    if (bopisLink.attr('data-bopisAvail') === 'true') {
        bopisLink.addClass('bopisAvailable');
        $('#store_bopisMsg, #id_PIP_invokeBopisOverlay_link').addClass('bopisAvailable');
    }
});

$thdPIP.doAfterCount = 0;

$(document).ready(function() {
    //set $root
    if (!isAppliance) {
        $root = $('#hd-pip');
    } else {
        $root = $('#hd-bica');
    }
    // Hide the promotion end date if the eligible for retail discount flag is false
    if($('#eligibleForRetailDiscount').val() != undefined && $('#eligibleForRetailDiscount').val() == "false") {
    	$('.savingsPromoEndDate').html('');
    }
    $thdPIP.doAfter();

    //Variable set to be used to see if product is a ssku 
    var isSSKUavail = (typeof(SKU_DATA_JSON));

    //if cart button is hidden, hide the qtybox and qtybox label. 
    if ($('.addToCart_btn').css('display') == 'none') {
        $('#buybox_quantity_field').hide();
        $("label[for='buybox_quantity_field']").hide();
    } else {
        $('#buybox_quantity_field').show();
        $("label[for='buybox_quantity_field']").show();
    }

    //Required Parts overlay, Fancy box
    $("#requiredParts_modal").fancybox({
        'width': 556,
        'height': 220,
        'autoDimensions': false,
        'scrolling': 'no',
        'autoScale': false,
        'showCloseButton': false,
        'transitionIn': 'none',
        'transitionOut': 'none',
        'hideOnOverlayClick': false,
        'type': 'iframe',
        'onComplete': function() {
            $('#fancybox-frame').load(function() { //wait for frame to load and then assign its height to fancybox-content
                $('#fancybox-content').css('height', $(this).contents().find('body').height());
            });
            //assign fancybox-content height to SSKU_Overlay_ReqParts_Container
            $('.SSKU_Overlay_ReqParts_Container').css('height', parseInt($('#fancybox-frame').contents().find('body').height()) + 30);
        }
    });


    //Check local store value being set by the global variable locStoreNbr (readCookie("THD_LOCSTORE"))which 
    // + contain store number, name and address.
    //If value is available then get only the store value
    //This is also a check to see if the user has been localized
    function getlocStorVal() {
        try {
            if (locStoreNbr != null || locStoreNbr != "") {
                return locStoreNbr.substring(0, locStoreNbr.indexOf('+'));
            }
        } catch (err) {
            return 'error';
        }
    }

    var locStorValue = getlocStorVal();
    if (locStorValue === '' && locStorValue !== 'error') {
        getLocalizedVal();
    }

    if (window.hasIRGItem == true) {
        var bp = thd.buildProduct;
        if (window.PRODUCT_METADATA_JSON) {
            bp.defaultObj = bp.currentProduct.get(_hddata["productID1"]);
        }

        var isMultiATC = (isAppliance) ? false : true;
        $('#irgContainer').thdIRG({
            setIRGsku: CI_ItemID,
            multiATC: isMultiATC,
            hasIrgItems: true
        });
    } else {
    	$('#irgContainer').parent().removeClass('withBorder');
		$('#irgContainer').hide();
    }

    if (!applianceFlag && typeof thd != 'undefined' && typeof thd.pipBuyBox != 'undefined') {
        thd.pipBuyBox.bbAddToCartClicked();
        thd.pipBuyBox.bbPayPal();
    }

    $("#f_editZipCode").bind("keypress", function(event) {
        if (!disableEnterKey(event)) {
            event.preventDefault();
            $('.btn_do_updateZip').click();
        }
    });


    // init inline player
    if (typeof PRODUCT_INLINE_PLAYER_JSON != 'undefined') {
        thd.buildProduct.inlinePlayer.sliderConfig(true, PRODUCT_INLINE_PLAYER_JSON, 4, false, 0);
    }
    $('.product_mainimg').on("click", ".primaryImage, .pipVideoOverlay", function(e) {
        removePlayer();
        if (thd.buildProduct.inlinePlayer.currentProductImg.isVideo) {
            $('.product_mainimg').html('');
        }
        thd.buildProduct.inlinePlayer.sliderConfig(false, thd.buildProduct.inlinePlayer.data, 9, true, thd.buildProduct.inlinePlayer.currentThumb);
        trimInlineTitle("#inlinePlayer-overlay .product_title", 75);
        e.preventDefault();
        _hddata["overlayType"] = "pipOverlay";
        var pageHeight = $(document).height();

        $("body").append("<div class='overlay-bg'></div>");
        $("#inlinePlayer-overlay").css('display', 'block');
        $("#inlinePlayer-overlay").centerOverlay();
        $(".overlay-bg").height(pageHeight).css({
            'opacity': 0.7,
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'background-color': '#333',
            'width': '100%',
            'z-index': 5000
        });
        $('#inlinePlayer-overlay #fancybox-close').show();

    });

    //Check that the product title the zoom larger overlay is greater than 80 and trim if it is
    trimInlineTitle("#inlinePlayer-overlay .product_title", 75);

    $('#inlinePlayer-overlay #fancybox-close').click(function(e) {
        e.preventDefault();
        removePlayer();
        thd.buildProduct.inlinePlayer.currentProductImg.isOverlay = false;
        thd.buildProduct.inlinePlayer.maxPods = 4;
        THD.thdSliderCustomControls.slideNum = parseInt(thd.buildProduct.inlinePlayer.currentThumb / (thd.buildProduct.inlinePlayer.maxPods + 1));
        thd.buildProduct.inlinePlayer.updatePrimaryImg();
        $(".overlay-bg, .primarySlider.slider_controls").remove();
        $("#inlinePlayer-overlay").css('display', 'none');
    });
    $(document).on("click", ".overlay-bg", function() {
        $("#inlinePlayer-overlay #fancybox-close").trigger("click");
    });
    $(document).keydown(function(e) {
        var code = e.keyCode;
        if (code === 27 && thd.buildProduct.inlinePlayer.currentProductImg.isOverlay) {
            $("#inlinePlayer-overlay #fancybox-close").trigger("click");
        }
    });
    $('.product_containerimg').on("click", ".thumbImage a", function() {
        $('.sliderPip .thumbImage a').removeClass('selected');
        removePlayer();
        thd.buildProduct.inlinePlayer.currentThumb = parseInt($(this).attr('rel'));
        thd.buildProduct.inlinePlayer.videoID = thd.buildProduct.inlinePlayer.currentProductImg.media[thd.buildProduct.inlinePlayer.currentThumb].videoId;
        thd.buildProduct.inlinePlayer.buildControls.selectedThumb();
        thd.buildProduct.inlinePlayer.updatePrimaryImg();
    });
    stripedTables();

    var el = $('#menuScroll');
    var top_offset = $('.product_Info_Scroll').offset().top - 50;
    if ($('.product_Info_Scroll') !== undefined) {
    	$(window).bind('scroll resize', function(event) {

            var scroll_top = $(window).scrollTop();

            if (scroll_top > top_offset) {
                el.slideDown(300);
            } else {
                el.hide();
            }
        });
        showSectionHeader('#menuScroll');
    }
    showSectionHeader('.product_mainreviews');
    showSectionHeader('#tabsHeader');
    showSectionHeader('.product_ZoneA_Discontinued');

    goToCustomerReviewsFromPLP();

    thd.buildProduct.stickyNav.update();
    if (isAppliance) {
        trimInlineTitle(".product_promo_ctn .tip-Opener span", 120);
    } else {
        trimInlineTitle(".product_promo_ctn .tip-Opener span", 65);
    }

    if ($('#availableInLocalStore').val() != 'true') {
        $('.storeSku').hide();
    }

});

function showStoreFinder(openStoreFinderPopup) {
    // Append the string to retain selected fulfillment options after localization
    if (!(window.location.hash.indexOf("&localizationPopup") > -1)) {
        window.location.hash = window.location.hash + "&localizationPopup";
    }
    // Execute only for ATC - non-localized users when BOPIS/BOSS selected.
    if (openStoreFinderPopup) {
        if ($('#bbChangeLocationBoss').length > 0) {
            $('#bbChangeLocationBoss').click();
        } else if ($('#bbChangeLocationBopis').length > 0) {
            $('#bbChangeLocationBopis').click();
        }
    }
}

function showMerchandiseZipCodeChange() {
    $('#overlay_editZipcode').css({
        'display': 'block'
    });
}

function showOverlay(OverlayConfig) {
    $.fancybox(OverlayConfig);
    return;
}

function setOmnitureShoppingCartInfo(qty) {
    return true;
}

function clearCartDataFields() {
    $('.triggerATCAppliOverlay').attr('data-prodstatus', '');
    $('.triggerATCAppliOverlay').attr('data-zip', '');
    $('.triggerATCAppliOverlay').attr('data-delvdate', '');
}

function goToCustomerReviewsFromPLP() {
    if (window.location.hash === '#customer_reviews') {
        window.setTimeout(function() {
            $('html,body').animate({
                scrollTop: 0
            }, 0);
            $('a[href="#customer_reviews"]:first').trigger('click');
        }, 750);
    }
}