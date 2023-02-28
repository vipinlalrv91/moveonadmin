module.exports = (sequelize,DataTypes) =>{
    const EnquiryImage = sequelize.define("enquiry_images",{
      enquiry_image_id: {
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
      enquiry_id: {// enquiry reference
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {freezeTableName: true,
     timestamps:true});

    return EnquiryImage;
}