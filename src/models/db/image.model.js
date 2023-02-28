module.exports = (sequelize,DataTypes) =>{
    const Image = sequelize.define("images",{
      image_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      image: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      uploaded_on:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue:new Date()
      },
      file_type: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      size:{
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      image_type:{
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue:"ENQUIRY"//HOME_PAGE PORTFOLIO_THUMB PORTFOLIO SERVICE ENQUIRY ENQUIRY_THEME
      }
    },
    {freezeTableName: true,
     timestamps: true});

    return Image;
}