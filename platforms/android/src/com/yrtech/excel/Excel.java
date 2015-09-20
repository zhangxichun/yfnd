package com.yrtech.excel;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.os.Environment;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.io.File;
import java.io.IOException;

import jxl.CellType;
import jxl.Sheet;
import jxl.Workbook;
import jxl.read.biff.BiffException;
import jxl.write.Label;
import jxl.write.WritableCell;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import jxl.write.WriteException;
import jxl.write.WritableCellFormat;
import jxl.write.biff.RowsExceededException;

/**
* This class echoes a string called from JavaScript.
*/
public class Excel extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("echo")) {
		    String fileName = args.getJSONArray(0).getJSONObject(0).getString("ShopCode")+"_"+(new SimpleDateFormat("yyyyMMddhhmmss")).format(new Date())+".xls";
			this.writeExcel1(this.cordova.getActivity().getApplicationContext(), callbackContext, "英菲尼迪库存盘点" +"/" + fileName, args.getJSONArray(0), args.getJSONArray(1));
			callbackContext.success(fileName);
	        return true;
        }
        return false;
    }

    private void writeExcel1(Context cxt, CallbackContext callbackContext, String strOutFileName, JSONArray answerList1, JSONArray answerList2) throws JSONException
    {
        try {
            Workbook wb = Workbook.getWorkbook(cxt.getAssets().open("template.xls"));
            WritableWorkbook workbook  =  Workbook.createWorkbook(new File(Environment.getExternalStorageDirectory(), strOutFileName), wb);
			
			WritableCellFormat format0 = new  WritableCellFormat();
			format0.setBorder(jxl.format.Border.ALL,jxl.format.BorderLineStyle.THIN);

			WritableCellFormat format1 = new  WritableCellFormat();
			format1.setAlignment(jxl.format.Alignment.CENTRE);
			format1.setVerticalAlignment(jxl.format.VerticalAlignment.CENTRE);
			format1.setBorder(jxl.format.Border.ALL,jxl.format.BorderLineStyle.THIN);

			WritableCellFormat format2 = new  WritableCellFormat();
			format2.setBorder(jxl.format.Border.ALL,jxl.format.BorderLineStyle.THIN);
			format2.setWrap(true);

            WritableSheet sheet1 = workbook.getSheet(0);
			this.writeCell(sheet1,1,1,answerList1.getJSONObject(0).getString("ShopCode"));
            for(int i=0;i<answerList1.length();i++){
			    int row = i+6;
				JSONObject answer = answerList1.getJSONObject(i);
                this.writeCell(sheet1,0,row,i+1+"", format0);
                this.writeCell(sheet1,1,row,answer.getString("ShopCode"), format2);
                this.writeCell(sheet1,2,row,answer.getString("VinCode"), format1);
                this.writeCell(sheet1,3,row,answer.getString("ModelName"), format1);
                this.writeCell(sheet1,4,row,answer.getString("SubModelName"), format1);
                this.writeCell(sheet1,5,row,answer.getString("StockAge"), format1);
                this.writeCell(sheet1,6,row,answer.getString("SaleFlag"), format1);
                this.writeCell(sheet1,7,row,("").equals(answer.getString("PhotoName"))?"":"1", format1);
                this.writeCell(sheet1,8,row,("").equals(answer.getString("PhotoName"))?"1":"", format1);
                this.writeCell(sheet1,9,row,("").equals(answer.getString("PhotoName"))?"无":"有", format1);
                this.writeCell(sheet1,10,row,answer.getString("Remark"), format0);
            }
			if(answerList2.length() > 0){
				WritableSheet sheet2 = workbook.getSheet(1);
				this.writeCell(sheet2,1,1,answerList2.getJSONObject(0).getString("ShopCode"));
				for(int i=0;i<answerList2.length();i++){
					int row = i+6;
					JSONObject answer = answerList2.getJSONObject(i);
					this.writeCell(sheet2,0,row,i+1+"", format0);
					this.writeCell(sheet2,1,row,answer.getString("ShopCode"), format2);
					this.writeCell(sheet2,2,row,answer.getString("VinCode"), format1);
					this.writeCell(sheet2,3,row,answer.getString("ModelName"), format1);
					this.writeCell(sheet2,4,row,answer.getString("PhotoName"), format1);
					this.writeCell(sheet2,5,row,answer.getString("Remark"), format0);
				}
			}
            workbook.write();
            workbook.close();
        } catch (IOException e) {
			callbackContext.error(e.getMessage());
            e.printStackTrace();
        } catch (RowsExceededException e) {
			callbackContext.error(e.getMessage());
            e.printStackTrace();
        } catch (WriteException e) {
			callbackContext.error(e.getMessage());
            e.printStackTrace();
        } catch (BiffException e) {
			callbackContext.error(e.getMessage());
            e.printStackTrace();
        }
    }

    private void writeCell(WritableSheet sheet,int col,int row, String value, WritableCellFormat format) throws WriteException {
        Label label = new Label(col, row, value, format);
        sheet.addCell(label);
    }

	private void writeCell(WritableSheet sheet,int col,int row, String value) throws WriteException {
        Label label = new Label(col, row, value);
        sheet.addCell(label);
    }
}