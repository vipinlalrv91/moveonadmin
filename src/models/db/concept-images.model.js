module.exports = (sequelize,DataTypes) =>{
    const ConceptImage = sequelize.define("concept_images",{
      concept_image_id: {
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

    return ConceptImage;
}