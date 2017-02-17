import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        mapLayer: null
    },
    mutations: {
        addGeoJsonLayer(state, feature){
            state.mapLayer = feature
        }
    }
})
