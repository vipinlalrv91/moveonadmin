module.exports = (sequelize,DataTypes) =>{
    const Portfolio = sequelize.define("portfolios",{
      portfolio_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      hex_id:{//alter native id for view
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      short_title:{
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      thumb_image:{//image reference
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      }
    },
    {freezeTableName: true,
     timestamps:true});

    return Portfolio;
}