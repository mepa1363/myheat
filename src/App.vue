<template>
<div id="app">
    <search-bar></search-bar>
    <br />
    <leaflet-map></leaflet-map>

</div>
</template>

<script>
import SearchBar from './components/Search.vue'
import LeafletMap from './components/Map.vue'

export default {
    components: {
        SearchBar,
        LeafletMap
    }
}
</script>





<style src="../node_modules/vue-material/dist/vue-material.css"></style>

<style>
#app {
    position: absolute;
    width: 100%;
    height: 100%;
    line-height: 0;
}
</style>
