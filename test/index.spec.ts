import pluginTester from 'babel-plugin-tester'
import path from 'path'
import plugin from '../dist/esm/index'

pluginTester({
	plugin: plugin,
	// fixtures: path.join(__dirname, '__fixtures__'),
	// endOfLine: 'lf'
	tests: {
		props: {
			only: true,
			title: 'props -> defineProps',
			fixture: path.resolve(__dirname, './__fixtures__/props/code.js'),
			snapshot: true
		}
	}
})

	// {
	// 	data: {
	// 		only: true,
	// 		code: `export default {
	// 			data () {
	// 				return {
	// 					lastName: 'Tom'
	// 				}
	// 			}
	// 		}`,
	// 		title: 'data -> reactive',
	// 		snapshot: true,
	// 	},
	// 	props: {
	// 		only: true,
	// 		title: 'props -> defineProps',
	// 		fixture: path.resolve(__dirname, './fixtures/props/input.js'),
	// 		outputFixture: path.resolve(__dirname, './fixtures/props/output.js'),
	// 	}
	// },
