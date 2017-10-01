module.exports = {
  entry: './src/app.jsx',
  output:{
    path: __dirname + '/static',
    publicPath: '/assets/',
    filename: 'app.bundle.js'
  },
  devtool: 'source-map',
  module:{
    loaders:[{
      test: /\.jsx$/,
      loader: 'babel-loader',
      query:{
        presets:['react', 'es2015']
      }
    },
    { test: /\.css$/, loader: "style-loader!css-loader" }
  ]
  },
  devServer:{
    contentBase: __dirname + '/static/',
    proxy:{
      '/api/*':{
        target: 'http://localhost:3000'
      }
    }
  }
};
