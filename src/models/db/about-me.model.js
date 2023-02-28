module.exports = (sequelize,DataTypes) =>{
    const AboutMe = sequelize.define("about_me",{
      about_me_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      short_title:{
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue:""
      },
      title:{
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue:""
      },
      description:{
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue:""
      },
      image_id:{//image reference
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      },
      signature_image_id:{//image reference
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      },

    },
    {freezeTableName: true,
     timestamps:true});

    return AboutMe;
}