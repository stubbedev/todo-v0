const listMatrix = {items:{}};
const itemMatrix = { subItems: {}, complete: false, text: "", id: null };
const subItemMatrix = { complete: false, text: "", id: null};

let listState = Object.assign({}, listMatrix);
let user;
let schema = {
    placeholders: {
        add_subitem: 'Add subitem',
        add_item: 'Add item'
    },
    settings: {
        storage_method: 'cloud', //Options are cloud, local and none
        color_scheme: 'light' //Options are light and dark
    },
    css_assets: {
        remove_icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash2" viewBox="0 0 16 16"><path d="M14 3a.702.702 0 0 1-.037.225l-1.684 10.104A2 2 0 0 1 10.305 15H5.694a2 2 0 0 1-1.973-1.671L2.037 3.225A.703.703 0 0 1 2 3c0-1.105 2.686-2 6-2s6 .895 6 2zM3.215 4.207l1.493 8.957a1 1 0 0 0 .986.836h4.612a1 1 0 0 0 .986-.836l1.493-8.957C11.69 4.689 9.954 5 8 5c-1.954 0-3.69-.311-4.785-.793z"/></svg>`,
        add_item_icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-plus" viewBox="0 0 16 16"><path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"/><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/></svg`,
        checkmark_icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/></svg>`
    }
}


const createUserIdentity = async () => {
    let browserInfo = getBrowserInfo();
    let fingerprint = renderFingerPrint();
    let userIdentity = await hashCode(browserInfo+fingerprint);
    return userIdentity;
}

const hashCode = async (string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
}

const renderFingerPrint = () => {
    const canvas = document.getElementById('fingerprint');
    const ctx = canvas.getContext('2d');
    // Text with lowercase/uppercase/punctuation symbols
    var txt = "sTub>BbeE,ioN <can.vas>:` 24601il";
    ctx.textBaseline = "top";
    // The most common type
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    // Some tricks for color mixing to increase the difference in rendering
    ctx.fillStyle = "#069";
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(txt, 4, 17);
    image_hash = canvas.toDataURL();
    canvas.remove();
    return image_hash.substr(image_hash.length - 128);
}

const getBrowserInfo = () => {
    let ram = window.navigator.deviceMemory ? window.navigator.deviceMemory : 0;
    let cpus = window.navigator.hardwareConcurrency;
    let platform = window.navigator.platform;
    let language = window.navigator.language;
    let touchpoints = window.navigator.maxTouchPoints;
    let screen = window.screen.height+'x'+window.screen.width+'x'+window.screen.pixelDepth;
    let output = `${ram}${cpus}${platform}${language}${touchpoints}${screen}`;
    return output;
}

const loadApp = async (method) => {
    listState = Object.assign({}, listMatrix);
    switch(method){
        case 'cloud':
            await loadDataCloud(user);
            break;
        case 'local':
            loadDataLocal();
            break;
        case 'none':
            loadDataNone();
            break;
    }
    buildDOMState();
}
const storeData = (method) => {
    switch(method){
        case 'cloud':
        storeDataCloud(user);
        break;
        case 'local':
        storeDataLocal();
        break;
        case 'none':
        storeDataNone();
        break;
    }
    console.table(listState);
}
const storeDataCloud = async (user_id) => {
    const rawResponse = await fetch('./backend/index.php?user_id='+user_id, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listState)
      });
    const content = await rawResponse.json();
    console.log(listState, 'Storing data');
}
const loadDataCloud = async (user_id) => {
	const response = await fetch(
		'./backend/index.php?user_id='+user_id,
		{
			method: 'GET',
			headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
			}
		}
	);
    const content = await response.json();
    listState = (content.items !== false) ? content : Object.assign({}, listMatrix);
    console.log(content, 'Loading data');
}

const purgeDataCloud = async (user_id) => {
    const response = await fetch(
		'./backend/index.php?user_id='+user_id,
		{
			method: 'DELETE'
		}
	);
    const content = await response.json();
    console.log(content, 'Purging data');
    listState = Object.assign({}, listMatrix);
}
const storeDataLocal = () => {
    localStorage.setItem("list", JSON.stringify(listState));
}
const loadDataLocal = () => {
    if (localStorage.getItem("list") !== null) {
        listState = JSON.parse(localStorage.getItem("list"));
    }
}
const generateId = () =>{
    let id = Math.random()+10000000000000;
    id = (id/Date.now()).toString(36).replace('.','');
    return id;
}
const validateEnterKey = (event) => {
    if (event.keyCode == 13 && !event.shiftKey) {
       return true;
    } else {
       return false;
    }
}
const validateEscapeKey = (event) => {
    if (event.keyCode == 27) {
       return true;
    } else {
       return false;
    }
}
const validateTabKey = (event) => {
    if (event.keyCode == 9) {
       return true;
    } else {
       return false;
    }
}

const getInputValue = (event, element) => {
    let target = (element)? element : event.target;
    let text;
    if(target.value && target.value.length > 0){
        text = target.value;
    } else {
        text = target.innerHTML;
    }
    text = text.replace(/\n/g, '<br>');
    return text;
}
const mousePositionRuntime = (event) => {
    console.log('Mouse position is:'+ event.x +'px, ' + event.y + 'px')
}
const mouseClickRuntime = (event) => {
    let element = event.target;
    let utility = (element.attributes.utl) ? element.attributes.utl.value : false;
    let elementTypeEditable = ((element.localName.indexOf('text') > -1 || element.localName.indexOf('input') > -1) && element.contentEditable != 'true') ? true : false;
    let elementTypeCheckbox = (element.localName.indexOf('checkbox') > -1) ? true : false;
    let elementTypeRemove = (element.localName.indexOf('remove') > -1) ? true : false;
    if(elementTypeEditable){
        element.setAttribute("contenteditable", "true");
        element.focus();
    }
    if(elementTypeCheckbox || elementTypeRemove){
        handleInputState(event);
    }
    if(utility){
        switch(utility){
            case 'session_end':
                sessionEnd();
                break;
            case 'session_tasks':
                showUI('tasks');
                break;
            case 'session_profile':
                showUI('profile');
                break;
            case 'session_purge':
                var answer = window.confirm("Purge data?");
                if(answer){
                    purgeDataCloud(user);
                    window.alert('Who the fuck is this guy?!');
                }else{
                    window.alert('Your data is safe with this website for sure! :)');
                }
                break;
        }
    }
}
const mouseDownRuntime = (event) => {
    console.log('Mouse held on: '+event);
}
const mouseUpRuntime = (event) => {
    console.log('Mouse release on: '+event);
}
const keyDownRuntime = (event) => {
    handleKeystroke(event);
}
const keyUpRuntime = (event) => {
    console.log('Key up in: '+event.target);
}
const focusInRuntime = (event) => {
    console.log('Focus in: '+event.target);
}
const resetInputState = (event) => {
    event.preventDefault();
    let element = event.target;
    let elementType = ((element.localName.indexOf('text') > -1 || element.localName.indexOf('input') > -1)) ? true : false;
    let resetText = (element.dataset.type == 'item-text' || element.dataset.type == 'subitem-text') ? true : false;
    if(elementType){
        element.setAttribute("contenteditable", "false");
        if(!resetText){
        element.value = "";
        element.innerHTML = "";
        }
        element.blur();
    }
}
const handleInputState = (event) => {
    let tagType = event.target.dataset.type;
    switch (tagType) {
        case 'input':
            updateItemObj(event, itemMatrix, 'add_item');
            break;
        case 'subitem-input': 
            updateItemObj(event,subItemMatrix, 'add_subitem');
            break;
        case 'item-text':
            updateItemObj(event, itemMatrix, 'edit_item');
            break;
        case 'subitem-text':
            updateItemObj(event, subItemMatrix , 'edit_subitem');
            break;
        case 'item-checkbox':
            updateItemObj(event, itemMatrix, 'toggle_item');
            break;
        case 'subitem-checkbox':
            updateItemObj(event, subItemMatrix, 'toggle_subitem');
            break;
        case 'item-remove':
            updateItemObj(event, null, 'remove_item');
            break;
        case 'subitem-remove':
            updateItemObj(event, null, 'remove_subitem');
            break;
    }
}
const handleKeystroke = (event) => {
    if(validateEnterKey(event)){
        event.preventDefault();
        handleInputState(event);
        resetInputState(event);
    }
    if(validateEscapeKey(event)){
        event.preventDefault();
        handleInputState(event);
        resetInputState(event);
    }
    if(validateTabKey(event)){
        event.preventDefault();
        document.querySelector('[utl="action_quickadd_text"]').focus();
    }
}
const updateItemObj = (event, matrix, command) => {
    console.log('Updating item object');
    let element = event.target;
    let text = '',
        id = null,
        complete = false,
        subItems = {};
    let parentItem = (element.closest('item-wrapper')) ? element.closest('item-wrapper').id : undefined;
    console.log('Command: '+command);
    switch (command) {
        case 'edit_item':
            text = getInputValue(event);
            id = (element.closest('item-wrapper')) ? element.closest('item-wrapper').id : undefined;
            listState.items[id].text = text;
            break;

        case 'edit_subitem':
            text = getInputValue(event);
            id = (element.closest('subitem')) ? element.closest('subitem').id : undefined;
            listState.items[parentItem].subItems[id].text = text;
            break;
        case 'add_subitem':
            text = getInputValue(event);
            id = generateId();
            item = generateItemObject(matrix,text,id);
            console.log(parentItem, item);
            let tempItem = listState.items[parentItem];
            tempItem.subItems[id] = item;
            listState.items[parentItem] = tempItem;
            //listState.items[parentItem].subItems[id] = item;
            subItemNodeObject = createSubItemNode(item);
            document.querySelector(`[id="${parentItem}"] subitems`).append(subItemNodeObject);
            break;
        case 'add_item':
            text = getInputValue(event);
            id = generateId();
            item = generateItemObject(matrix,text,id,complete,subItems);
            listState.items[id] = item;
            itemNodeObject = createItemNode(item);
            document.querySelector('tasks').prepend(itemNodeObject);
            break;
        case 'toggle_item':
            container = (element.closest('item-wrapper')) ? element.closest('item-wrapper') : undefined;
            id = container.id;
            text = getInputValue(event, container.querySelector('item-text'));
            complete = (element.attributes.checked) ? false : true;
            if(!complete){
                element.removeAttribute('checked');
            } else {
                element.setAttribute('checked', '');
            }
            listState.items[id].complete = complete;
            break;
        case 'toggle_subitem':
            container = (element.closest('subitem')) ? element.closest('subitem') : undefined;
            id = container.id;
            text = getInputValue(event, container.querySelector('subitem-text'));
            complete = (element.attributes.checked) ? false : true;
            if(!complete){
                element.removeAttribute('checked');
            } else {
                element.setAttribute('checked', '');
            }
            listState.items[parentItem].subItems[id].complete = complete;
            break;
        case 'remove_item':
            id = (element.closest('item-wrapper')) ? element.closest('item-wrapper').id : undefined;
            delete listState.items[id];
            element.closest('item-wrapper').remove();
            break;
        case 'remove_subitem':
            id = (element.closest('subitem')) ? element.closest('subitem').id : undefined;
            delete listState.items[parentItem].subItems[id];
            element.closest('subitem').remove();
            break;
    }
    storeData(schema.settings.storage_method);
}
const generateItemObject = (matrix, text, id, complete, subItems) => {
    let item = Object.assign({}, matrix);
    item.text = text;
    item.id = id;
    if(complete){
    item.complete = complete;
    }
    if(subItems){
        item.subItems = subItems;
    }
    return item;
}
const createItemNode = (item) => {
    let itemNodeObject = document.createElement('item-wrapper');
    let checked = (item.complete) ? 'checked' : '';
    let itemNodeObjectHTML = `<item id="${item.id}">
                                <item-content>
                                <item-checkbox data-type="item-checkbox" ${checked}>
                                    &#10003;
                                </item-checkbox>
                                <item-text data-type="item-text">
                                    ${item.text}
                                </item-text>
                                <item-remove data-type="item-remove">
                                ${schema.css_assets.remove_icon}
                                </item-remove>
                              </item-content>
                              </item>
                              <subitems>
                              </subitems>
                              <subitem-input data-parent="${item.id}" data-type="subitem-input" data-placeholder="${schema.placeholders.add_subitem}"></subitem-input>
                              `;
    itemNodeObject.id = item.id;
    itemNodeObject.innerHTML = itemNodeObjectHTML;
    return itemNodeObject;
}
const createSubItemNode = (subItem) => {
    let subItemNodeObject = document.createElement('subitem');
    let checked = (subItem.complete) ? 'checked' : '';
    let subItemNodeObjectHTML = `<subitem-content>
                                    <subitem-checkbox data-type="subitem-checkbox" ${checked}>
                                        &#10003;
                                    </subitem-checkbox>
                                    <subitem-text data-type="subitem-text">
                                        ${subItem.text}
                                    </subitem-text>
                                    <subitem-remove data-type="subitem-remove">
                                        ${schema.css_assets.remove_icon}
                                    </subitem-remove>
                                </subitem-content>`;
    subItemNodeObject.id = subItem.id;
    subItemNodeObject.innerHTML = subItemNodeObjectHTML;
    return subItemNodeObject;
}

const generatePanelNode = (title, data, section) => {
    let panelNodeObject = document.createElement('panel');
    let panelNodeObjectHTML = `<panel-content>
                                <panel-title>
                                    ${title}
                                </panel-title>
                                ${data}
                                </panel-content>`;
    panelNodeObject.id = section;
    panelNodeObject.innerHTML = panelNodeObjectHTML;
    return panelNodeObject;
}

const buildDOMState = () => {
    let items = listState.items;
    Object.entries(items).forEach(([key, value]) => {
        item = value;
        itemNodeObject = createItemNode(item);
        document.querySelector('tasks').prepend(itemNodeObject);
        if(item.subItems){
            subItems = Object.entries(item.subItems).forEach(([key, value]) => {
                subItem = value;
                subItemNodeObject = createSubItemNode(subItem);
                document.querySelector(`[id="${item.id}"] subitems`).append(subItemNodeObject);
            });
        }
    });
    let panel = generatePanelNode('Public fingerprint: ', user, 'profile');
    document.querySelector('profile').append(panel);
}

const showUI = (component) => {
    components = document.querySelectorAll('fora > *');
    components.forEach(item=>{
        if(item.localName !== component){
            item.style.display = 'none';
        } else {
            item.style.display = '';
        }
    });
}

const init = async () => {

    //document.addEventListener('mousemove', mousePositionRuntime);
    //document.addEventListener('mousedown', mouseDownRuntime);
    //document.addEventListener('mouseup', mouseUpRuntime);
    document.addEventListener('click', mouseClickRuntime);
    document.addEventListener('keydown', keyDownRuntime);
    //document.addEventListener('keyup', keyUpRuntime);
    //document.addEventListener('focusin', focusInRuntime);
    user = await createUserIdentity();
    loadApp(schema.settings.storage_method);
}

init();