<template>
<md-layout class="app-search">
    <input type="text" class="app-searchbox" @input="onInput" @keyup.esc="isOpen = false" v-model="keyword" />
    <md-list v-show="isOpen" class="autocomplete-list">
        <md-list-item class="autocomplete-list-item" v-if="hasResults === true" v-for="(item, index) in filteredItems" @click="select(index)">
            <md-icon>place</md-icon>
            <span>{{ item.value }}</span>
        </md-list-item>
        <md-list-item class="autocomplete-list-item no-results" v-if="hasResults === false">
            <md-icon>warning</md-icon>
            <span>No results found!</span>
        </md-list-item>
    </md-list>
</md-layout>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            isOpen: false,
            hasResults: false,
            keyword: '',
            items: [],
            selectedItem: '',
            geom: ''
        }
    },
    methods: {
        onInput(value) {

            this.isOpen = !!value

            if (this.keyword !== '') {
                var app = this
                axios.get("https://search.mapzen.com/v1/autocomplete?api_key=search-tMIQuH8&boundary.country=CA&focus.point.lat=51&focus.point.lon=-114&text=" + this.keyword)
                    .then(function(response) {
                        const data = response.data
                        app.items = []
                        for (var i = 0; i < data.features.length; i++) {
                            app.items.push({
                                value: data.features[i].properties.label,
                                geom: data.features[i].geometry
                            })
                        }
                    })
                    .catch(function(error) {
                        console.log(error)
                    })
            }
        },
        select(index) {
            this.selectedItem = this.filteredItems[index]
            this.keyword = this.selectedItem.value
            this.geom = this.selectedItem.geom
            this.isOpen = false
            //search
            this.$store.commit('addGeoJsonLayer', this.geom)
            this.keyword = ''
        }

    },
    computed: {
        filteredItems() {
            if (this.items.length > 0) {
                this.hasResults = true
            } else {
                this.hasResults = false
            }
            return this.items
        }
    }
}
</script>

<style>
.app-search {
    position: absolute;
    top: 20px;
    left: 25%;
    width: 50%;
    z-index: 1002;
}

.autocomplete-list {
    display: flex;
    border: 1px solid #dbdbdb;
    overflow: hidden;
    z-index: 1002;
    position: absolute;
    top: 60px;
    width: 100%;
}

.autocomplete-list .no-results {
    pointer-events: none;
}

.app-searchbox {
    background: #fff;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);
    border-radius: 2px;
    border: 1px solid #ededed;
    cursor: default;
    font-size: 16px;
    font-weight: 400;
    width: 100%;
    padding: 0 16px;
    height: 50px;
    border: none;
}

.app-searchbox:hover,
.app-searchbox:focus {
    box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
    border: none;
    outline: none;
    cursor: text;
}
</style>
