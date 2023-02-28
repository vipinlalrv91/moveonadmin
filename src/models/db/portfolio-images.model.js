module.exports = (sequelize,DataTypes) =>{
    const PortfolioImage = sequelize.define("portfolio_images",{
      portfolio_image_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      image_id:{//image reference
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      },
      portfolio_id:{
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {freezeTableName: true,
     timestamps:true});

    return PortfolioImage;
}