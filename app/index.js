import { startAppLoop } from 'cx/ui';
import requests from './requests'
import {store} from './store'
require('./index.scss');


var stop;
if (module.hot) {
    // accept itself
    module.hot.accept();

    // remember data on dispose
    module.hot.dispose(function (data) {
        data.state = store.getData();
        if (stop)
            stop();
    });

    // apply data on hot replace
    if (module.hot.data)
        store.load(module.hot.data);
}
stop = startAppLoop(document.getElementById('app'), store, requests);