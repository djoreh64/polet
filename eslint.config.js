import antfu from '@antfu/eslint-config'

export default antfu({
	react: true,
	typescript: true,
	stylistic: {
		jsx: true,
		indent: 'tab',
		quotes: 'single',
		semi: false,
	},
	formatters: true,
	rules: {
		'perfectionist/sort-imports': 'off',
		'no-console': 'off',
	},
})
