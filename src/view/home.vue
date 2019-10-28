<template>
	<div>
		<div>首页</div>
		<button @click="$router.push('ceshi')">进入测试页</button>
	</div>
</template>

<script>
import layerBall from './test.js'
	export default {
		data() {
			return {
				options:{
					imgUrl:'http://wx.qlogo.cn/mmopen/ajNVdqHZLLDl7sS5womuDgEgY2jiadBmZYwhzLXFPZ6Z1l1gmwnuRVH2sttNAnxhcvzbrdNsXH0l4ODP3J6UyLw/0'
				}
			}
		},
		name: 'home',
		mounted() {
			layerBall(this.options);
		},
	}
</script>

<style lang="scss" scoped="">
	@import '../scss/_variable.scss';
</style>